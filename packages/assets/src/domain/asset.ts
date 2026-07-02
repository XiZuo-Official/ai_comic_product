import { z } from "zod";

import type {
  AssetMetadata,
  AssetStatus,
  CreateAssetInput,
  CreateAssetUploadUrlInput,
  UpdateAssetInput,
  UploadAssetFileInput
} from "../api";

export const assetStatuses = ["uploading", "ready", "failed", "archived", "deleted"] as const;
export const allowedAssetMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "text/plain"] as const;
export const maxAssetFileSizeBytes = 25 * 1024 * 1024;

export const assetStatusSchema = z.enum(assetStatuses);

export const assetMetadataSchema = z.record(z.unknown()).default({});

export const assetTagNameSchema = z.string().trim().min(1, "Tag name is required").max(40, "Tag name is too long");

export const createAssetUploadUrlSchema = z
  .object({
    fileName: z.string().trim().min(1, "File name is required").max(180, "File name is too long"),
    fileSize: z.coerce
      .number()
      .int()
      .positive("File size must be greater than zero")
      .max(maxAssetFileSizeBytes, "File is too large"),
    mimeType: z.enum(allowedAssetMimeTypes, { errorMap: () => ({ message: "Unsupported file type" }) }),
    projectId: z.string().trim().min(1, "Project id is required")
  })
  .strict();

export const createAssetSchema = createAssetUploadUrlSchema
  .extend({
    description: z.string().trim().max(500, "Asset description is too long").optional().nullable(),
    displayName: z.string().trim().min(1, "Asset name is required").max(160, "Asset name is too long").optional().nullable(),
    metadata: assetMetadataSchema.optional(),
    status: assetStatusSchema.optional(),
    storageKey: z.string().trim().min(1, "Storage key is required"),
    storageProvider: z.literal("local"),
    tags: z.array(assetTagNameSchema).max(12, "Too many tags").optional()
  })
  .strict();

export const uploadAssetFileSchema = createAssetUploadUrlSchema
  .extend({
    content: z.instanceof(Uint8Array),
    description: z.string().trim().max(500, "Asset description is too long").optional().nullable(),
    displayName: z.string().trim().min(1, "Asset name is required").max(160, "Asset name is too long").optional().nullable(),
    metadata: assetMetadataSchema.optional(),
    tags: z.array(assetTagNameSchema).max(12, "Too many tags").optional()
  })
  .strict();

export const updateAssetSchema = z
  .object({
    description: z.string().trim().max(500, "Asset description is too long").optional().nullable(),
    displayName: z.string().trim().min(1, "Asset name is required").max(160, "Asset name is too long").optional(),
    metadata: assetMetadataSchema.optional(),
    status: assetStatusSchema.optional(),
    tags: z.array(assetTagNameSchema).max(12, "Too many tags").optional()
  })
  .strict()
  .refine(
    (value) =>
      value.description !== undefined ||
      value.displayName !== undefined ||
      value.metadata !== undefined ||
      value.status !== undefined ||
      value.tags !== undefined,
    { message: "At least one asset field is required" }
  );

export function parseCreateAssetUploadUrlInput(input: CreateAssetUploadUrlInput): CreateAssetUploadUrlInput {
  return createAssetUploadUrlSchema.parse(input);
}

export function parseCreateAssetInput(input: CreateAssetInput): CreateAssetInput {
  return createAssetSchema.parse(input);
}

export function parseUploadAssetFileInput(input: UploadAssetFileInput): UploadAssetFileInput {
  return uploadAssetFileSchema.parse(input);
}

export function parseUpdateAssetInput(input: UpdateAssetInput): UpdateAssetInput {
  return updateAssetSchema.parse(input);
}

export function normalizeAssetDescription(value?: string | null): string | null {
  const normalized = value?.trim();

  return normalized && normalized.length > 0 ? normalized : null;
}

export function normalizeAssetDisplayName(input: { displayName?: string | null; fileName: string }): string {
  const normalized = input.displayName?.trim();

  return normalized && normalized.length > 0 ? normalized : input.fileName.trim();
}

export function normalizeAssetMetadata(value?: AssetMetadata): AssetMetadata {
  return value ?? {};
}

export function normalizeAssetStatus(value?: AssetStatus): AssetStatus {
  return value ?? "ready";
}

export function normalizeTagName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeTagKey(value: string): string {
  return normalizeTagName(value).toLowerCase();
}

export function normalizeTagNames(values?: string[]): string[] {
  const tagMap = new Map<string, string>();

  for (const value of values ?? []) {
    const name = normalizeTagName(value);
    const key = normalizeTagKey(name);

    if (name.length > 0) {
      tagMap.set(key, tagMap.get(key) ?? name);
    }
  }

  return [...tagMap.values()];
}
