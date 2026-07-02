import { getAsset, listProjectAssets } from "@ai-comic/assets";
import { getComicPage, listProjectComicPages, type ComicPageDetail, type ComicPanel } from "@ai-comic/comic-studio";
import { getProject } from "@ai-comic/projects";
import { readStoredObject, storeObject } from "@ai-comic/storage";

import type {
  CreateExportInput,
  DownloadExportArtifact,
  ExportArtifact,
  ExportJobWithArtifact,
  ExportSettings,
  ExportSourceSnapshot
} from "../api";
import { escapeHtml, exportFileName, normalizeExportSettings, parseCreateExportInput } from "../domain/export";
import {
  createExportArtifactRow,
  createExportJobRow,
  findExportJobRow,
  listExportJobRows,
  updateExportJobRow
} from "../infrastructure/export-repository";

type ResolvedPanel = ComicPanel & {
  assetPreviewUrl: string | null;
  assetName: string | null;
};

type ResolvedPage = ComicPageDetail & {
  resolvedPanels: ResolvedPanel[];
};

export async function createProjectExport(ownerId: string, input: CreateExportInput): Promise<ExportJobWithArtifact> {
  const parsed = parseCreateExportInput(input);
  const settings = normalizeExportSettings(parsed);
  const project = await getProject(ownerId, parsed.projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const job = await createExportJobRow({
    format: settings.format,
    ownerId,
    projectId: parsed.projectId,
    settings
  });

  try {
    await updateExportJobRow({
      exportJobId: job.id,
      ownerId,
      status: "processing"
    });

    const pages = await loadResolvedPages(ownerId, parsed.projectId);
    const sourceSnapshot = createSourceSnapshot(parsed.projectId, pages);
    const content = renderHtmlExport({
      pages,
      projectName: project.name,
      settings
    });
    const encoded = new TextEncoder().encode(content);
    const fileName = exportFileName({ createdAt: job.createdAt, projectName: project.name });
    const storedObject = await storeObject({
      content: encoded,
      contentLength: encoded.byteLength,
      contentType: "text/html; charset=utf-8",
      fileName,
      ownerId,
      projectId: parsed.projectId
    });
    const artifact = await createExportArtifactRow({
      exportJobId: job.id,
      fileName,
      fileSize: encoded.byteLength,
      mimeType: "text/html; charset=utf-8",
      ownerId,
      projectId: parsed.projectId,
      storageKey: storedObject.storageKey,
      storageProvider: storedObject.storageProvider
    });
    const completedJob = await updateExportJobRow({
      completedAt: new Date(),
      errorMessage: null,
      exportJobId: job.id,
      ownerId,
      sourceSnapshot,
      status: "completed"
    });

    return {
      ...completedJob,
      artifact
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    const failedJob = await updateExportJobRow({
      completedAt: new Date(),
      errorMessage: message,
      exportJobId: job.id,
      ownerId,
      status: "failed"
    });

    return {
      ...failedJob,
      artifact: null
    };
  }
}

export async function getExportJob(ownerId: string, exportJobId: string): Promise<ExportJobWithArtifact | null> {
  return findExportJobRow(ownerId, exportJobId);
}

export async function listProjectExports(ownerId: string, projectId: string): Promise<ExportJobWithArtifact[]> {
  const project = await getProject(ownerId, projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  return listExportJobRows(ownerId, projectId);
}

export async function downloadExportArtifact(ownerId: string, exportJobId: string): Promise<DownloadExportArtifact> {
  const job = await findExportJobRow(ownerId, exportJobId);

  if (!job) {
    throw new Error("Export job not found");
  }

  if (job.status !== "completed" || !job.artifact) {
    throw new Error("Export artifact is not ready");
  }

  const storedObject = await readStoredObject({
    storageKey: job.artifact.storageKey,
    storageProvider: job.artifact.storageProvider
  });

  return {
    body: storedObject.body,
    fileName: job.artifact.fileName,
    mimeType: job.artifact.mimeType
  };
}

async function loadResolvedPages(ownerId: string, projectId: string): Promise<ResolvedPage[]> {
  const pages = await listProjectComicPages(ownerId, projectId);

  if (pages.length === 0) {
    throw new Error("No comic pages found");
  }

  const [details, assets] = await Promise.all([
    Promise.all(
      pages.map(async (page) => {
        const detail = await getComicPage(ownerId, page.id);

        if (!detail) {
          throw new Error(`Missing source page: ${page.id}`);
        }

        return detail;
      })
    ),
    listProjectAssets(ownerId, projectId)
  ]);
  const assetIds = new Set(assets.map((asset) => asset.id));

  return Promise.all(
    details.map(async (page) => ({
      ...page,
      resolvedPanels: await Promise.all(page.panels.map((panel) => resolvePanel(ownerId, projectId, panel, assetIds)))
    }))
  );
}

async function resolvePanel(ownerId: string, projectId: string, panel: ComicPanel, projectAssetIds: Set<string>): Promise<ResolvedPanel> {
  if (!panel.assetId) {
    return {
      ...panel,
      assetName: null,
      assetPreviewUrl: null
    };
  }

  if (!projectAssetIds.has(panel.assetId)) {
    throw new Error(`Missing asset for panel: ${panel.id}`);
  }

  const asset = await getAsset(ownerId, panel.assetId);

  if (!asset || asset.projectId !== projectId || asset.status !== "ready") {
    throw new Error(`Missing asset for panel: ${panel.id}`);
  }

  return {
    ...panel,
    assetName: asset.displayName,
    assetPreviewUrl: asset.mimeType.startsWith("image/") ? asset.previewUrl : null
  };
}

function createSourceSnapshot(projectId: string, pages: ResolvedPage[]): ExportSourceSnapshot {
  return {
    capturedAt: new Date().toISOString(),
    pageCount: pages.length,
    pages: pages.map((page) => ({
      pageId: page.id,
      pageNumber: page.pageNumber,
      title: page.title,
      updatedAt: page.updatedAt.toISOString()
    })),
    projectId
  };
}

function renderHtmlExport(input: { pages: ResolvedPage[]; projectName: string; settings: ExportSettings }): string {
  const pages = input.pages.map(renderPage).join("\n");
  const metadata = input.settings.includeMetadata
    ? `<p class="meta">Generated from ${input.pages.length} saved Comic Studio page${input.pages.length === 1 ? "" : "s"}.</p>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.projectName)} Export</title>
  <style>
    :root { color-scheme: light; font-family: Georgia, "Times New Roman", serif; background: #f8fafc; color: #0f172a; }
    body { margin: 0; padding: 32px; }
    main { display: grid; gap: 32px; margin: 0 auto; max-width: 920px; }
    h1, h2 { font-family: "Trebuchet MS", sans-serif; margin: 0; }
    .meta { color: #64748b; margin: 8px 0 0; }
    .page { background: #fff; border: 2px solid #0f172a; border-radius: 24px; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.14); padding: 24px; }
    .canvas { aspect-ratio: 2 / 3; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 18px; overflow: hidden; position: relative; }
    .panel { background: #fff; border: 3px solid #0f172a; border-radius: 12px; box-sizing: border-box; overflow: hidden; position: absolute; }
    .panel img { display: block; height: 100%; object-fit: cover; width: 100%; }
    .panel-empty { align-items: center; color: #94a3b8; display: flex; font-family: "Trebuchet MS", sans-serif; height: 100%; justify-content: center; padding: 12px; text-align: center; }
    .bubble { align-items: center; background: #fff; border: 2px solid #0f172a; border-radius: 48%; box-sizing: border-box; display: flex; font-family: "Trebuchet MS", sans-serif; font-size: 13px; font-weight: 700; justify-content: center; line-height: 1.2; padding: 10px; position: absolute; text-align: center; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>${escapeHtml(input.projectName)}</h1>
      ${metadata}
    </header>
    ${pages}
  </main>
</body>
</html>`;
}

function renderPage(page: ResolvedPage): string {
  const panels = page.resolvedPanels.map(renderPanel).join("\n");
  const bubbles = page.bubbles.map((bubble) => {
    const style = `left:${bubble.x}%;top:${bubble.y}%;width:${bubble.width}%;height:${bubble.height}%;z-index:${bubble.orderIndex + 20};`;

    return `<div class="bubble" style="${style}">${escapeHtml(bubble.text)}</div>`;
  }).join("\n");

  return `<section class="page">
  <h2>Page ${page.pageNumber}: ${escapeHtml(page.title)}</h2>
  <div class="canvas">
    ${panels}
    ${bubbles}
  </div>
</section>`;
}

function renderPanel(panel: ResolvedPanel): string {
  const style = `left:${panel.x}%;top:${panel.y}%;width:${panel.width}%;height:${panel.height}%;z-index:${panel.orderIndex + 1};`;
  const content = panel.assetPreviewUrl
    ? `<img src="${escapeHtml(panel.assetPreviewUrl)}" alt="${escapeHtml(panel.assetName ?? "Panel asset")}" />`
    : `<div class="panel-empty">Panel ${panel.orderIndex + 1}</div>`;

  return `<div class="panel" style="${style}">${content}</div>`;
}
