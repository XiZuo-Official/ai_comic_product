import { getProject } from "@ai-comic/projects";
import { createUploadTarget, resolveStorageUrl, storeObject } from "@ai-comic/storage";

import type { Asset, CreateAssetInput, CreateAssetUploadUrlInput, UpdateAssetInput, UploadAssetFileInput } from "../api";
import {
  normalizeAssetDescription,
  normalizeAssetDisplayName,
  normalizeAssetMetadata,
  normalizeAssetStatus,
  normalizeTagNames,
  parseCreateAssetInput,
  parseCreateAssetUploadUrlInput,
  parseUpdateAssetInput,
  parseUploadAssetFileInput
} from "../domain/asset";
import { createAssetRow, deleteAssetRow, findAssetRow, listAssetRows, toAsset, updateAssetRow } from "../infrastructure/asset-repository";

async function assertProjectAccess(ownerId: string, projectId: string): Promise<void> {
  const project = await getProject(ownerId, projectId);

  if (!project) {
    throw new Error("Project not found");
  }
}

function toPublicAsset(row: Parameters<typeof toAsset>[0]): Asset {
  return toAsset(
    row,
    resolveStorageUrl({
      storageKey: row.storageKey,
      storageProvider: row.storageProvider as "local"
    })
  );
}

export async function createAssetUploadUrl(ownerId: string, input: CreateAssetUploadUrlInput) {
  const parsed = parseCreateAssetUploadUrlInput(input);
  await assertProjectAccess(ownerId, parsed.projectId);

  return createUploadTarget({
    contentLength: parsed.fileSize,
    contentType: parsed.mimeType,
    fileName: parsed.fileName,
    ownerId,
    projectId: parsed.projectId
  });
}

export async function createAsset(ownerId: string, input: CreateAssetInput): Promise<Asset> {
  const parsed = parseCreateAssetInput(input);
  await assertProjectAccess(ownerId, parsed.projectId);

  const row = await createAssetRow({
    description: normalizeAssetDescription(parsed.description),
    displayName: normalizeAssetDisplayName({ displayName: parsed.displayName, fileName: parsed.fileName }),
    fileSize: parsed.fileSize,
    metadata: normalizeAssetMetadata(parsed.metadata),
    mimeType: parsed.mimeType,
    ownerId,
    projectId: parsed.projectId,
    status: normalizeAssetStatus(parsed.status),
    storageKey: parsed.storageKey,
    storageProvider: parsed.storageProvider,
    tags: normalizeTagNames(parsed.tags)
  });

  return toPublicAsset(row);
}

export async function uploadAssetFile(ownerId: string, input: UploadAssetFileInput): Promise<Asset> {
  const parsed = parseUploadAssetFileInput(input);
  await assertProjectAccess(ownerId, parsed.projectId);

  const storedObject = await storeObject({
    content: parsed.content,
    contentLength: parsed.fileSize,
    contentType: parsed.mimeType,
    fileName: parsed.fileName,
    ownerId,
    projectId: parsed.projectId
  });

  return createAsset(ownerId, {
    description: parsed.description,
    displayName: parsed.displayName,
    fileName: parsed.fileName,
    fileSize: parsed.fileSize,
    metadata: parsed.metadata,
    mimeType: parsed.mimeType,
    projectId: parsed.projectId,
    status: "ready",
    storageKey: storedObject.storageKey,
    storageProvider: storedObject.storageProvider,
    tags: parsed.tags
  });
}

export async function listProjectAssets(ownerId: string, projectId: string): Promise<Asset[]> {
  await assertProjectAccess(ownerId, projectId);
  const rows = await listAssetRows(ownerId, projectId);

  return rows.map(toPublicAsset);
}

export async function getAsset(ownerId: string, assetId: string): Promise<Asset | null> {
  const row = await findAssetRow(ownerId, assetId);

  return row ? toPublicAsset(row) : null;
}

export async function updateAsset(ownerId: string, assetId: string, input: UpdateAssetInput): Promise<Asset> {
  const parsed = parseUpdateAssetInput(input);
  const row = await updateAssetRow({
    assetId,
    description: parsed.description !== undefined ? normalizeAssetDescription(parsed.description) : undefined,
    displayName:
      parsed.displayName !== undefined && parsed.displayName !== null
        ? normalizeAssetDisplayName({ displayName: parsed.displayName, fileName: "" })
        : undefined,
    metadata: parsed.metadata !== undefined ? normalizeAssetMetadata(parsed.metadata) : undefined,
    ownerId,
    status: parsed.status,
    tags: parsed.tags !== undefined ? normalizeTagNames(parsed.tags) : undefined
  });

  return toPublicAsset(row);
}

export async function deleteAsset(ownerId: string, assetId: string): Promise<void> {
  await deleteAssetRow(ownerId, assetId);
}
