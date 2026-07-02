export type StorageProviderId = "local";

export type CreateUploadTargetInput = {
  contentLength: number;
  contentType: string;
  fileName: string;
  ownerId: string;
  projectId: string;
};

export type UploadTarget = {
  expiresAt: Date;
  storageKey: string;
  storageProvider: StorageProviderId;
  uploadUrl: string;
};

export type StoreObjectInput = CreateUploadTargetInput & {
  content: Uint8Array;
};

export type StoredObject = {
  storageKey: string;
  storageProvider: StorageProviderId;
};

export type ResolveStorageUrlInput = {
  storageKey: string;
  storageProvider: StorageProviderId;
};

export type ReadStoredObjectInput = ResolveStorageUrlInput;

export type ReadStoredObjectResult = {
  body: Uint8Array;
  contentType: string;
};
