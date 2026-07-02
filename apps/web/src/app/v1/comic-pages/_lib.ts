import type { ComicBubble, ComicLayoutVersion, ComicPage, ComicPageDetail, ComicPanel } from "@ai-comic/comic-studio";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function requireComicStudioUserId(): Promise<string | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return userId;
}

export function comicPageResponse(page: ComicPage) {
  return {
    id: page.id,
    createdAt: page.createdAt.toISOString(),
    deletedAt: page.deletedAt?.toISOString() ?? null,
    metadata: page.metadata,
    ownerId: page.ownerId,
    pageNumber: page.pageNumber,
    projectId: page.projectId,
    status: page.status,
    title: page.title,
    updatedAt: page.updatedAt.toISOString()
  };
}

export function comicPanelResponse(panel: ComicPanel) {
  return {
    id: panel.id,
    assetId: panel.assetId,
    createdAt: panel.createdAt.toISOString(),
    height: panel.height,
    metadata: panel.metadata,
    orderIndex: panel.orderIndex,
    ownerId: panel.ownerId,
    pageId: panel.pageId,
    projectId: panel.projectId,
    updatedAt: panel.updatedAt.toISOString(),
    width: panel.width,
    x: panel.x,
    y: panel.y
  };
}

export function comicBubbleResponse(bubble: ComicBubble) {
  return {
    id: bubble.id,
    createdAt: bubble.createdAt.toISOString(),
    height: bubble.height,
    metadata: bubble.metadata,
    orderIndex: bubble.orderIndex,
    ownerId: bubble.ownerId,
    pageId: bubble.pageId,
    panelId: bubble.panelId,
    projectId: bubble.projectId,
    text: bubble.text,
    updatedAt: bubble.updatedAt.toISOString(),
    width: bubble.width,
    x: bubble.x,
    y: bubble.y
  };
}

export function comicPageDetailResponse(page: ComicPageDetail) {
  return {
    ...comicPageResponse(page),
    bubbles: page.bubbles.map(comicBubbleResponse),
    panels: page.panels.map(comicPanelResponse)
  };
}

export function comicLayoutVersionResponse(version: ComicLayoutVersion) {
  return {
    id: version.id,
    action: version.action,
    createdAt: version.createdAt.toISOString(),
    pageId: version.pageId,
    snapshot: version.snapshot
  };
}

export function comicStudioErrorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid Comic Studio request" }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Comic Studio request failed";
  const status =
    message === "Project not found" || message === "Comic page not found" || message === "Comic panel not found" || message === "Comic bubble not found" || message === "Asset not found"
      ? 404
      : 400;

  return NextResponse.json({ error: message }, { status });
}

export function isRouteResponse(value: string | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
