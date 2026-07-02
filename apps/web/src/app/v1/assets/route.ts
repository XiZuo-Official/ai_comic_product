import { createAsset } from "@ai-comic/assets";
import { NextResponse } from "next/server";

import { assetErrorResponse, assetResponse, isRouteResponse, requireAssetsUserId } from "./_lib";

export async function POST(request: Request) {
  const userId = await requireAssetsUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const body = await request.json();
    const asset = await createAsset(userId, {
      description: body.description,
      displayName: body.displayName,
      fileName: body.fileName,
      fileSize: body.fileSize,
      metadata: body.metadata,
      mimeType: body.mimeType,
      projectId: body.projectId,
      status: body.status,
      storageKey: body.storageKey,
      storageProvider: body.storageProvider,
      tags: body.tags
    });

    return NextResponse.json({ asset: assetResponse(asset) }, { status: 201 });
  } catch (error) {
    return assetErrorResponse(error);
  }
}
