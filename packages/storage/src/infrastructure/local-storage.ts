import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  CreateUploadTargetInput,
  ReadStoredObjectInput,
  ReadStoredObjectResult,
  StoreObjectInput,
  StoredObject,
  UploadTarget
} from "../api";
import { parseCreateUploadTargetInput, parseResolveStorageUrlInput, sanitizeStorageSegment } from "../domain/storage";

const LOCAL_STORAGE_PROVIDER = "local" as const;

function storageRoot(): string {
  return process.env.LOCAL_STORAGE_DIR ?? path.join(process.cwd(), ".local-storage");
}

function objectPath(storageKey: string): string {
  return path.join(storageRoot(), storageKey);
}

function metadataPath(storageKey: string): string {
  return `${objectPath(storageKey)}.metadata.json`;
}

function createStorageKey(input: CreateUploadTargetInput): string {
  return [
    "assets",
    sanitizeStorageSegment(input.ownerId),
    sanitizeStorageSegment(input.projectId),
    `${randomUUID()}-${sanitizeStorageSegment(input.fileName)}`
  ].join("/");
}

export function createLocalUploadTarget(input: CreateUploadTargetInput): UploadTarget {
  const parsed = parseCreateUploadTargetInput(input);
  const storageKey = createStorageKey(parsed);

  return {
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    storageKey,
    storageProvider: LOCAL_STORAGE_PROVIDER,
    uploadUrl: resolveLocalStorageUrl(storageKey)
  };
}

export async function storeLocalObject(input: StoreObjectInput): Promise<StoredObject> {
  const parsed = parseCreateUploadTargetInput(input);
  const storageKey = createStorageKey(parsed);
  const destination = objectPath(storageKey);

  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, input.content);
  await writeFile(metadataPath(storageKey), JSON.stringify({ contentType: parsed.contentType }));

  return {
    storageKey,
    storageProvider: LOCAL_STORAGE_PROVIDER
  };
}

export function resolveLocalStorageUrl(storageKey: string): string {
  const encodedKey = storageKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/v1/storage/local/${encodedKey}`;
}

export async function readLocalObject(input: ReadStoredObjectInput): Promise<ReadStoredObjectResult> {
  const parsed = parseResolveStorageUrlInput(input);
  const [body, metadata] = await Promise.all([
    readFile(objectPath(parsed.storageKey)),
    readFile(metadataPath(parsed.storageKey), "utf8").catch(() => "{\"contentType\":\"application/octet-stream\"}")
  ]);
  const parsedMetadata = JSON.parse(metadata) as { contentType?: string };

  return {
    body: new Uint8Array(body),
    contentType: parsedMetadata.contentType ?? "application/octet-stream"
  };
}
