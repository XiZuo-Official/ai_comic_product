import { z } from "zod";

import type { CreateUploadTargetInput, ResolveStorageUrlInput } from "../api";

export const storageProviderSchema = z.literal("local");

export const createUploadTargetSchema = z.object({
  contentLength: z.coerce.number().int().positive("File size must be greater than zero"),
  contentType: z.string().trim().min(1, "Content type is required").max(120),
  fileName: z.string().trim().min(1, "File name is required").max(180),
  ownerId: z.string().trim().min(1, "Owner id is required"),
  projectId: z.string().trim().min(1, "Project id is required")
});

export const resolveStorageUrlSchema = z.object({
  storageKey: z.string().trim().min(1, "Storage key is required"),
  storageProvider: storageProviderSchema
});

export function parseCreateUploadTargetInput(input: CreateUploadTargetInput): CreateUploadTargetInput {
  return createUploadTargetSchema.parse(input);
}

export function parseResolveStorageUrlInput(input: ResolveStorageUrlInput): ResolveStorageUrlInput {
  return resolveStorageUrlSchema.parse(input);
}

export function sanitizeStorageSegment(value: string): string {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized.length > 0 ? sanitized : "file";
}
