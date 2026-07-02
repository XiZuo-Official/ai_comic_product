import { z } from "zod";

import type { CharacterMetadata, CharacterVersionAction, CreateCharacterInput, UpdateCharacterInput } from "../api";

export const characterNameSchema = z.string().trim().min(1, "Character name is required").max(120, "Character name is too long");
export const characterDescriptionSchema = z.string().trim().max(800, "Character description is too long").optional().nullable();
export const characterMetadataSchema = z.record(z.unknown()).default({});
export const characterReferenceAssetIdsSchema = z.array(z.string().trim().min(1, "Reference asset id is required")).max(12, "Too many reference assets");

export const createCharacterSchema = z
  .object({
    description: characterDescriptionSchema,
    metadata: characterMetadataSchema.optional(),
    name: characterNameSchema,
    projectId: z.string().trim().min(1, "Project id is required"),
    referenceAssetIds: characterReferenceAssetIdsSchema.optional()
  })
  .strict();

export const updateCharacterSchema = z
  .object({
    description: characterDescriptionSchema,
    metadata: characterMetadataSchema.optional(),
    name: characterNameSchema.optional(),
    referenceAssetIds: characterReferenceAssetIdsSchema.optional()
  })
  .strict()
  .refine(
    (value) =>
      value.description !== undefined ||
      value.metadata !== undefined ||
      value.name !== undefined ||
      value.referenceAssetIds !== undefined,
    { message: "At least one character field is required" }
  );

export function parseCreateCharacterInput(input: CreateCharacterInput): CreateCharacterInput {
  return createCharacterSchema.parse(input);
}

export function parseUpdateCharacterInput(input: UpdateCharacterInput): UpdateCharacterInput {
  return updateCharacterSchema.parse(input);
}

export function normalizeCharacterName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeCharacterKey(value: string): string {
  return normalizeCharacterName(value).toLowerCase();
}

export function normalizeCharacterDescription(value?: string | null): string | null {
  const normalized = value?.trim();

  return normalized && normalized.length > 0 ? normalized : null;
}

export function normalizeCharacterMetadata(value?: CharacterMetadata): CharacterMetadata {
  return value ?? {};
}

export function normalizeReferenceAssetIds(values?: string[]): string[] {
  return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))];
}

export function isCharacterVersionAction(value: CharacterVersionAction): boolean {
  return value === "created" || value === "updated" || value === "deleted" || value === "references_updated";
}
