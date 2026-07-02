"use server";

import { deleteAsset, updateAsset, uploadAssetFile } from "@ai-comic/assets";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

async function requireUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  return userId;
}

function parseTags(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseMetadata(value: FormDataEntryValue | null): Record<string, unknown> {
  const raw = String(value ?? "").trim();

  if (raw.length === 0) {
    return {};
  }

  const parsed = JSON.parse(raw) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Asset metadata must be a JSON object");
  }

  return parsed as Record<string, unknown>;
}

function assetLibraryPath(projectId: string): string {
  return `/projects/${projectId}/asset-library`;
}

export async function uploadAssetAction(formData: FormData) {
  const userId = await requireUserId();
  const projectId = String(formData.get("projectId") ?? "");
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("A file is required");
  }

  const content = new Uint8Array(await file.arrayBuffer());

  await uploadAssetFile(userId, {
    content,
    description: String(formData.get("description") ?? ""),
    displayName: String(formData.get("displayName") ?? file.name),
    fileName: file.name,
    fileSize: file.size,
    metadata: {
      originalFileName: file.name
    },
    mimeType: file.type,
    projectId,
    tags: parseTags(formData.get("tags"))
  });

  revalidatePath(assetLibraryPath(projectId));
}

export async function updateAssetAction(formData: FormData) {
  const userId = await requireUserId();
  const projectId = String(formData.get("projectId") ?? "");
  const assetId = String(formData.get("assetId") ?? "");

  await updateAsset(userId, assetId, {
    description: String(formData.get("description") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    metadata: parseMetadata(formData.get("metadata")),
    tags: parseTags(formData.get("tags"))
  });

  revalidatePath(assetLibraryPath(projectId));
}

export async function deleteAssetAction(formData: FormData) {
  const userId = await requireUserId();
  const projectId = String(formData.get("projectId") ?? "");
  const assetId = String(formData.get("assetId") ?? "");

  await deleteAsset(userId, assetId);
  revalidatePath(assetLibraryPath(projectId));
}
