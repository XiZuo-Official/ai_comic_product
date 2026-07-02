import type { Asset } from "@ai-comic/assets";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function requireAssetsUserId(): Promise<string | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return userId;
}

export function assetResponse(asset: Asset) {
  return {
    id: asset.id,
    createdAt: asset.createdAt.toISOString(),
    deletedAt: asset.deletedAt?.toISOString() ?? null,
    description: asset.description,
    displayName: asset.displayName,
    fileSize: asset.fileSize,
    metadata: asset.metadata,
    mimeType: asset.mimeType,
    ownerId: asset.ownerId,
    previewUrl: asset.previewUrl,
    projectId: asset.projectId,
    status: asset.status,
    storageKey: asset.storageKey,
    storageProvider: asset.storageProvider,
    tags: asset.tags,
    updatedAt: asset.updatedAt.toISOString()
  };
}

export function assetErrorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid asset request" }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Asset request failed";
  const status = message === "Asset not found" || message === "Project not found" ? 404 : 400;

  return NextResponse.json({ error: message }, { status });
}

export function isRouteResponse(value: string | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
