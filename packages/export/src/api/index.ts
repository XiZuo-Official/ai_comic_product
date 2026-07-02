import type { StorageProviderId } from "@ai-comic/storage";

export type ExportFormat = "html";

export type ExportJobStatus = "queued" | "processing" | "completed" | "failed";

export type ExportSettings = {
  format: ExportFormat;
  includeMetadata: boolean;
};

export type ExportSourcePageSnapshot = {
  pageId: string;
  pageNumber: number;
  title: string;
  updatedAt: string;
};

export type ExportSourceSnapshot = {
  capturedAt: string;
  pageCount: number;
  pages: ExportSourcePageSnapshot[];
  projectId: string;
};

export type ExportJob = {
  completedAt: Date | null;
  createdAt: Date;
  errorMessage: string | null;
  format: ExportFormat;
  id: string;
  ownerId: string;
  projectId: string;
  settings: ExportSettings;
  sourceSnapshot: ExportSourceSnapshot | null;
  status: ExportJobStatus;
  updatedAt: Date;
};

export type ExportArtifact = {
  createdAt: Date;
  exportJobId: string;
  fileName: string;
  fileSize: number;
  id: string;
  mimeType: string;
  ownerId: string;
  projectId: string;
  storageKey: string;
  storageProvider: StorageProviderId;
};

export type ExportJobWithArtifact = ExportJob & {
  artifact: ExportArtifact | null;
};

export type CreateExportInput = {
  format?: ExportFormat;
  includeMetadata?: boolean;
  projectId: string;
};

export type DownloadExportArtifact = {
  body: Uint8Array;
  fileName: string;
  mimeType: string;
};
