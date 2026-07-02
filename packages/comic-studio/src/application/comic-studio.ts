import { getAsset } from "@ai-comic/assets";
import { getProject } from "@ai-comic/projects";

import type {
  ComicLayoutVersion,
  ComicPage,
  ComicPageDetail,
  CreateComicBubbleInput,
  CreateComicPageInput,
  CreateComicPanelInput,
  UpdateComicBubbleInput,
  UpdateComicPageInput,
  UpdateComicPanelInput
} from "../api";
import {
  comicLayoutBoxSchema,
  normalizeComicMetadata,
  normalizeComicPageTitle,
  parseCreateComicBubbleInput,
  parseCreateComicPageInput,
  parseCreateComicPanelInput,
  parseUpdateComicBubbleInput,
  parseUpdateComicPageInput,
  parseUpdateComicPanelInput
} from "../domain/comic-studio";
import {
  createComicBubbleRow,
  createComicPageRow,
  createComicPanelRow,
  findComicBubbleRow,
  findComicPageDetailRow,
  findComicPanelRow,
  listComicLayoutVersionRows,
  listComicPageRows,
  updateComicBubbleRow,
  updateComicPageRow,
  updateComicPanelRow
} from "../infrastructure/comic-studio-repository";

async function assertProjectAccess(ownerId: string, projectId: string): Promise<void> {
  const project = await getProject(ownerId, projectId);

  if (!project) {
    throw new Error("Project not found");
  }
}

async function assertProjectAsset(ownerId: string, projectId: string, assetId?: string | null): Promise<void> {
  if (!assetId) {
    return;
  }

  const asset = await getAsset(ownerId, assetId);

  if (!asset || asset.projectId !== projectId) {
    throw new Error("Asset not found");
  }
}

async function assertPanelBelongsToPage(ownerId: string, pageId: string, panelId?: string | null): Promise<void> {
  if (!panelId) {
    return;
  }

  const panel = await findComicPanelRow(ownerId, panelId);

  if (!panel || panel.pageId !== pageId) {
    throw new Error("Comic panel not found");
  }
}

export async function listProjectComicPages(ownerId: string, projectId: string): Promise<ComicPage[]> {
  await assertProjectAccess(ownerId, projectId);

  return listComicPageRows(ownerId, projectId);
}

export async function getComicStudio(ownerId: string, projectId: string): Promise<{ pages: ComicPage[]; projectId: string }> {
  await assertProjectAccess(ownerId, projectId);

  return {
    pages: await listComicPageRows(ownerId, projectId),
    projectId
  };
}

export async function getComicPage(ownerId: string, pageId: string): Promise<ComicPageDetail | null> {
  return findComicPageDetailRow(ownerId, pageId);
}

export async function createComicPage(ownerId: string, input: CreateComicPageInput): Promise<ComicPageDetail> {
  const parsed = parseCreateComicPageInput(input);
  await assertProjectAccess(ownerId, parsed.projectId);

  const existingPages = await listComicPageRows(ownerId, parsed.projectId);
  const pageNumber = Math.max(0, ...existingPages.map((page) => page.pageNumber)) + 1;

  return createComicPageRow({
    metadata: normalizeComicMetadata(parsed.metadata),
    ownerId,
    projectId: parsed.projectId,
    title: normalizeComicPageTitle({ pageNumber, title: parsed.title })
  });
}

export async function updateComicPage(ownerId: string, pageId: string, input: UpdateComicPageInput): Promise<ComicPageDetail> {
  const parsed = parseUpdateComicPageInput(input);
  const existing = await findComicPageDetailRow(ownerId, pageId);

  if (!existing) {
    throw new Error("Comic page not found");
  }

  return updateComicPageRow({
    metadata: parsed.metadata !== undefined ? normalizeComicMetadata(parsed.metadata) : undefined,
    ownerId,
    pageId,
    title: parsed.title !== undefined ? normalizeComicPageTitle({ pageNumber: existing.pageNumber, title: parsed.title }) : undefined
  });
}

export async function createComicPanel(ownerId: string, input: CreateComicPanelInput): Promise<ComicPageDetail> {
  const parsed = parseCreateComicPanelInput(input);
  const page = await findComicPageDetailRow(ownerId, parsed.pageId);

  if (!page) {
    throw new Error("Comic page not found");
  }

  await assertProjectAsset(ownerId, page.projectId, parsed.assetId);

  return createComicPanelRow({
    assetId: parsed.assetId ?? null,
    height: parsed.height,
    metadata: normalizeComicMetadata(parsed.metadata),
    orderIndex: parsed.orderIndex ?? page.panels.length,
    ownerId,
    pageId: page.id,
    projectId: page.projectId,
    width: parsed.width,
    x: parsed.x,
    y: parsed.y
  });
}

export async function updateComicPanel(ownerId: string, panelId: string, input: UpdateComicPanelInput): Promise<ComicPageDetail> {
  const parsed = parseUpdateComicPanelInput(input);
  const existing = await findComicPanelRow(ownerId, panelId);

  if (!existing) {
    throw new Error("Comic panel not found");
  }

  comicLayoutBoxSchema.parse({
    height: parsed.height ?? existing.height,
    width: parsed.width ?? existing.width,
    x: parsed.x ?? existing.x,
    y: parsed.y ?? existing.y
  });

  await assertProjectAsset(ownerId, existing.projectId, parsed.assetId);

  return updateComicPanelRow({
    assetId: parsed.assetId,
    height: parsed.height,
    metadata: parsed.metadata !== undefined ? normalizeComicMetadata(parsed.metadata) : undefined,
    orderIndex: parsed.orderIndex,
    ownerId,
    panelId,
    width: parsed.width,
    x: parsed.x,
    y: parsed.y
  });
}

export async function createComicBubble(ownerId: string, input: CreateComicBubbleInput): Promise<ComicPageDetail> {
  const parsed = parseCreateComicBubbleInput(input);
  const page = await findComicPageDetailRow(ownerId, parsed.pageId);

  if (!page) {
    throw new Error("Comic page not found");
  }

  await assertPanelBelongsToPage(ownerId, page.id, parsed.panelId);

  return createComicBubbleRow({
    height: parsed.height,
    metadata: normalizeComicMetadata(parsed.metadata),
    orderIndex: parsed.orderIndex ?? page.bubbles.length,
    ownerId,
    pageId: page.id,
    panelId: parsed.panelId ?? null,
    projectId: page.projectId,
    text: parsed.text.trim(),
    width: parsed.width,
    x: parsed.x,
    y: parsed.y
  });
}

export async function updateComicBubble(ownerId: string, bubbleId: string, input: UpdateComicBubbleInput): Promise<ComicPageDetail> {
  const parsed = parseUpdateComicBubbleInput(input);
  const existing = await findComicBubbleRow(ownerId, bubbleId);

  if (!existing) {
    throw new Error("Comic bubble not found");
  }

  comicLayoutBoxSchema.parse({
    height: parsed.height ?? existing.height,
    width: parsed.width ?? existing.width,
    x: parsed.x ?? existing.x,
    y: parsed.y ?? existing.y
  });

  await assertPanelBelongsToPage(ownerId, existing.pageId, parsed.panelId);

  return updateComicBubbleRow({
    bubbleId,
    height: parsed.height,
    metadata: parsed.metadata !== undefined ? normalizeComicMetadata(parsed.metadata) : undefined,
    orderIndex: parsed.orderIndex,
    ownerId,
    panelId: parsed.panelId,
    text: parsed.text?.trim(),
    width: parsed.width,
    x: parsed.x,
    y: parsed.y
  });
}

export async function listComicLayoutVersions(ownerId: string, pageId: string): Promise<ComicLayoutVersion[]> {
  return listComicLayoutVersionRows(ownerId, pageId);
}
