import type { StorageProviderId } from "@ai-comic/storage";

export type AssetStatus = "uploading" | "ready" | "failed" | "archived" | "deleted";

export type AssetMetadata = Record<string, unknown>;

export type Asset = {
  createdAt: Date;
  deletedAt: Date | null;
  description: string | null;
  displayName: string;
  fileSize: number;
  id: string;
  metadata: AssetMetadata;
  mimeType: string;
  ownerId: string;
  previewUrl: string;
  projectId: string;
  status: AssetStatus;
  storageKey: string;
  storageProvider: StorageProviderId;
  tags: string[];
  updatedAt: Date;
};

export type AssetVariant = {
  assetId: string;
  createdAt: Date;
  fileSize: number | null;
  id: string;
  metadata: AssetMetadata;
  mimeType: string | null;
  status: AssetStatus;
  storageKey: string;
  storageProvider: StorageProviderId;
  variantType: string;
};

export type AssetTag = {
  createdAt: Date;
  id: string;
  name: string;
  normalizedName: string;
  ownerId: string;
  updatedAt: Date;
};

export type CreateAssetUploadUrlInput = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  projectId: string;
};

export type CreateAssetInput = CreateAssetUploadUrlInput & {
  description?: string | null;
  displayName?: string | null;
  metadata?: AssetMetadata;
  status?: AssetStatus;
  storageKey: string;
  storageProvider: StorageProviderId;
  tags?: string[];
};

export type UploadAssetFileInput = CreateAssetUploadUrlInput & {
  content: Uint8Array;
  description?: string | null;
  displayName?: string | null;
  metadata?: AssetMetadata;
  tags?: string[];
};

export type UpdateAssetInput = {
  description?: string | null;
  displayName?: string | null;
  metadata?: AssetMetadata;
  status?: AssetStatus;
  tags?: string[];
};
