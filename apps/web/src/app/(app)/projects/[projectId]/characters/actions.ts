"use server";

import { createCharacter, deleteCharacter, updateCharacter } from "@ai-comic/characters";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

async function requireUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  return userId;
}

function charactersPath(projectId: string): string {
  return `/projects/${projectId}/characters`;
}

function parseMetadata(value: FormDataEntryValue | null): Record<string, unknown> {
  const raw = String(value ?? "").trim();

  if (raw.length === 0) {
    return {};
  }

  const parsed = JSON.parse(raw) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Character metadata must be a JSON object");
  }

  return parsed as Record<string, unknown>;
}

function parseReferenceAssetIds(formData: FormData): string[] {
  return formData
    .getAll("referenceAssetIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

export async function createCharacterAction(formData: FormData) {
  const userId = await requireUserId();
  const projectId = String(formData.get("projectId") ?? "");

  await createCharacter(userId, {
    description: String(formData.get("description") ?? ""),
    metadata: parseMetadata(formData.get("metadata")),
    name: String(formData.get("name") ?? ""),
    projectId,
    referenceAssetIds: parseReferenceAssetIds(formData)
  });

  revalidatePath(charactersPath(projectId));
}

export async function updateCharacterAction(formData: FormData) {
  const userId = await requireUserId();
  const characterId = String(formData.get("characterId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");

  await updateCharacter(userId, characterId, {
    description: String(formData.get("description") ?? ""),
    metadata: parseMetadata(formData.get("metadata")),
    name: String(formData.get("name") ?? ""),
    referenceAssetIds: parseReferenceAssetIds(formData)
  });

  revalidatePath(charactersPath(projectId));
}

export async function deleteCharacterAction(formData: FormData) {
  const userId = await requireUserId();
  const characterId = String(formData.get("characterId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");

  await deleteCharacter(userId, characterId);
  revalidatePath(charactersPath(projectId));
}
