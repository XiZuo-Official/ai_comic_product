import {
  assetTags,
  assets,
  db,
  tags,
  type AssetRow,
  type TagRow
} from "@ai-comic/db";
import { and, desc, eq, isNull, ne } from "drizzle-orm";

import type { Asset, AssetMetadata, AssetStatus } from "../api";
import { normalizeTagKey, normalizeTagName } from "../domain/asset";

type AssetRowWithTags = AssetRow & {
  tags: string[];
};

export function toAsset(row: AssetRowWithTags, previewUrl: string): Asset {
  return {
    id: row.id,
    createdAt: row.createdAt,
    deletedAt: row.deletedAt,
    description: row.description,
    displayName: row.displayName,
    fileSize: row.fileSize,
    metadata: row.metadata as AssetMetadata,
    mimeType: row.mimeType,
    ownerId: row.ownerId,
    previewUrl,
    projectId: row.projectId,
    status: row.status as AssetStatus,
    storageKey: row.storageKey,
    storageProvider: row.storageProvider as "local",
    tags: row.tags,
    updatedAt: row.updatedAt
  };
}

async function tagNamesForAsset(assetId: string): Promise<string[]> {
  const rows = await db
    .select({ name: tags.name })
    .from(assetTags)
    .innerJoin(tags, eq(assetTags.tagId, tags.id))
    .where(eq(assetTags.assetId, assetId))
    .orderBy(tags.name);

  return rows.map((row) => row.name);
}

async function withTags(row: AssetRow): Promise<AssetRowWithTags> {
  return {
    ...row,
    tags: await tagNamesForAsset(row.id)
  };
}

export async function listAssetRows(ownerId: string, projectId: string): Promise<AssetRowWithTags[]> {
  const rows = await db
    .select()
    .from(assets)
    .where(and(eq(assets.ownerId, ownerId), eq(assets.projectId, projectId), isNull(assets.deletedAt), ne(assets.status, "deleted")))
    .orderBy(desc(assets.updatedAt));

  return Promise.all(rows.map(withTags));
}

export async function findAssetRow(ownerId: string, assetId: string): Promise<AssetRowWithTags | null> {
  const [asset] = await db
    .select()
    .from(assets)
    .where(and(eq(assets.ownerId, ownerId), eq(assets.id, assetId), isNull(assets.deletedAt), ne(assets.status, "deleted")))
    .limit(1);

  return asset ? withTags(asset) : null;
}

export async function createAssetRow(input: {
  description: string | null;
  displayName: string;
  fileSize: number;
  metadata: AssetMetadata;
  mimeType: string;
  ownerId: string;
  projectId: string;
  status: AssetStatus;
  storageKey: string;
  storageProvider: "local";
  tags: string[];
}): Promise<AssetRowWithTags> {
  const [asset] = await db
    .insert(assets)
    .values({
      description: input.description,
      displayName: input.displayName,
      fileSize: input.fileSize,
      metadata: input.metadata,
      mimeType: input.mimeType,
      ownerId: input.ownerId,
      projectId: input.projectId,
      status: input.status,
      storageKey: input.storageKey,
      storageProvider: input.storageProvider
    })
    .returning();

  await syncAssetTags(input.ownerId, asset.id, input.tags);

  return withTags(asset);
}

export async function updateAssetRow(input: {
  assetId: string;
  description?: string | null;
  displayName?: string | null;
  metadata?: AssetMetadata;
  ownerId: string;
  status?: AssetStatus;
  tags?: string[];
}): Promise<AssetRowWithTags> {
  const [asset] = await db
    .update(assets)
    .set({
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.displayName !== undefined && input.displayName !== null ? { displayName: input.displayName } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      updatedAt: new Date()
    })
    .where(and(eq(assets.ownerId, input.ownerId), eq(assets.id, input.assetId), isNull(assets.deletedAt), ne(assets.status, "deleted")))
    .returning();

  if (!asset) {
    throw new Error("Asset not found");
  }

  if (input.tags !== undefined) {
    await syncAssetTags(input.ownerId, asset.id, input.tags);
  }

  return withTags(asset);
}

export async function deleteAssetRow(ownerId: string, assetId: string): Promise<void> {
  const [asset] = await db
    .update(assets)
    .set({ deletedAt: new Date(), status: "deleted", updatedAt: new Date() })
    .where(and(eq(assets.ownerId, ownerId), eq(assets.id, assetId), isNull(assets.deletedAt)))
    .returning();

  if (!asset) {
    throw new Error("Asset not found");
  }
}

async function findOrCreateTag(ownerId: string, nameInput: string): Promise<TagRow> {
  const name = normalizeTagName(nameInput);
  const normalizedName = normalizeTagKey(name);
  const [existingTag] = await db
    .select()
    .from(tags)
    .where(and(eq(tags.ownerId, ownerId), eq(tags.normalizedName, normalizedName)))
    .limit(1);

  if (existingTag) {
    return existingTag;
  }

  const [tag] = await db
    .insert(tags)
    .values({
      name,
      normalizedName,
      ownerId
    })
    .returning();

  return tag;
}

async function syncAssetTags(ownerId: string, assetId: string, tagNames: string[]): Promise<void> {
  await db.delete(assetTags).where(eq(assetTags.assetId, assetId));

  if (tagNames.length === 0) {
    return;
  }

  const tagRows = await Promise.all(tagNames.map((tagName) => findOrCreateTag(ownerId, tagName)));

  await db.insert(assetTags).values(tagRows.map((tag) => ({ assetId, tagId: tag.id })));
}
