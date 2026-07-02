"use server";

import { createComicBubble, createComicPage, createComicPanel, updateComicBubble, updateComicPage, updateComicPanel } from "@ai-comic/comic-studio";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  return userId;
}

function studioPath(projectId: string, pageId?: string): string {
  return pageId ? `/projects/${projectId}/comic-studio?pageId=${pageId}` : `/projects/${projectId}/comic-studio`;
}

function parseOptionalId(value: FormDataEntryValue | null): string | null {
  const normalized = String(value ?? "").trim();

  return normalized.length > 0 ? normalized : null;
}

function parseOptionalMetadata(value: FormDataEntryValue | null): Record<string, unknown> | undefined {
  const raw = String(value ?? "").trim();

  if (raw.length === 0) {
    return undefined;
  }

  const parsed = JSON.parse(raw) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Comic Studio metadata must be a JSON object");
  }

  return parsed as Record<string, unknown>;
}

function numberValue(formData: FormData, key: string): number {
  return Number(formData.get(key));
}

export async function createComicPageAction(formData: FormData) {
  const userId = await requireUserId();
  const projectId = String(formData.get("projectId") ?? "");
  const page = await createComicPage(userId, {
    metadata: parseOptionalMetadata(formData.get("metadata")),
    projectId,
    title: String(formData.get("title") ?? "")
  });

  revalidatePath(studioPath(projectId));
  redirect(studioPath(projectId, page.id));
}

export async function updateComicPageAction(formData: FormData) {
  const userId = await requireUserId();
  const pageId = String(formData.get("pageId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");

  await updateComicPage(userId, pageId, {
    metadata: parseOptionalMetadata(formData.get("metadata")),
    title: String(formData.get("title") ?? "")
  });

  revalidatePath(studioPath(projectId, pageId));
}

export async function createComicPanelAction(formData: FormData) {
  const userId = await requireUserId();
  const pageId = String(formData.get("pageId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");

  await createComicPanel(userId, {
    assetId: parseOptionalId(formData.get("assetId")),
    height: numberValue(formData, "height"),
    metadata: parseOptionalMetadata(formData.get("metadata")),
    orderIndex: numberValue(formData, "orderIndex"),
    pageId,
    width: numberValue(formData, "width"),
    x: numberValue(formData, "x"),
    y: numberValue(formData, "y")
  });

  revalidatePath(studioPath(projectId, pageId));
}

export async function updateComicPanelAction(formData: FormData) {
  const userId = await requireUserId();
  const panelId = String(formData.get("panelId") ?? "");
  const pageId = String(formData.get("pageId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");

  await updateComicPanel(userId, panelId, {
    assetId: parseOptionalId(formData.get("assetId")),
    height: numberValue(formData, "height"),
    metadata: parseOptionalMetadata(formData.get("metadata")),
    orderIndex: numberValue(formData, "orderIndex"),
    width: numberValue(formData, "width"),
    x: numberValue(formData, "x"),
    y: numberValue(formData, "y")
  });

  revalidatePath(studioPath(projectId, pageId));
}

export async function createComicBubbleAction(formData: FormData) {
  const userId = await requireUserId();
  const pageId = String(formData.get("pageId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");

  await createComicBubble(userId, {
    height: numberValue(formData, "height"),
    metadata: parseOptionalMetadata(formData.get("metadata")),
    orderIndex: numberValue(formData, "orderIndex"),
    pageId,
    panelId: parseOptionalId(formData.get("panelId")),
    text: String(formData.get("text") ?? ""),
    width: numberValue(formData, "width"),
    x: numberValue(formData, "x"),
    y: numberValue(formData, "y")
  });

  revalidatePath(studioPath(projectId, pageId));
}

export async function updateComicBubbleAction(formData: FormData) {
  const userId = await requireUserId();
  const bubbleId = String(formData.get("bubbleId") ?? "");
  const pageId = String(formData.get("pageId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");

  await updateComicBubble(userId, bubbleId, {
    height: numberValue(formData, "height"),
    metadata: parseOptionalMetadata(formData.get("metadata")),
    orderIndex: numberValue(formData, "orderIndex"),
    panelId: parseOptionalId(formData.get("panelId")),
    text: String(formData.get("text") ?? ""),
    width: numberValue(formData, "width"),
    x: numberValue(formData, "x"),
    y: numberValue(formData, "y")
  });

  revalidatePath(studioPath(projectId, pageId));
}
