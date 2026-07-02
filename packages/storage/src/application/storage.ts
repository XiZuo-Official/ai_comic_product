import type {
  CreateUploadTargetInput,
  ReadStoredObjectInput,
  ReadStoredObjectResult,
  ResolveStorageUrlInput,
  StoreObjectInput,
  StoredObject,
  UploadTarget
} from "../api";
import { parseResolveStorageUrlInput } from "../domain/storage";
import { createLocalUploadTarget, readLocalObject, resolveLocalStorageUrl, storeLocalObject } from "../infrastructure/local-storage";

export function createUploadTarget(input: CreateUploadTargetInput): UploadTarget {
  return createLocalUploadTarget(input);
}

export async function storeObject(input: StoreObjectInput): Promise<StoredObject> {
  return storeLocalObject(input);
}

export function resolveStorageUrl(input: ResolveStorageUrlInput): string {
  const parsed = parseResolveStorageUrlInput(input);

  return resolveLocalStorageUrl(parsed.storageKey);
}

export async function readStoredObject(input: ReadStoredObjectInput): Promise<ReadStoredObjectResult> {
  return readLocalObject(input);
}
