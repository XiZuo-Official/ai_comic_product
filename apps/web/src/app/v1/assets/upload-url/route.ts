import { createAssetUploadUrl } from "@ai-comic/assets";
import { NextResponse } from "next/server";

import { assetErrorResponse, isRouteResponse, requireAssetsUserId } from "../_lib";

export async function POST(request: Request) {
  const userId = await requireAssetsUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const body = await request.json();
    const upload = await createAssetUploadUrl(userId, {
      fileName: body.fileName,
      fileSize: body.fileSize,
      mimeType: body.mimeType,
      projectId: body.projectId
    });

    return NextResponse.json({
      upload: {
        expiresAt: upload.expiresAt.toISOString(),
        storageKey: upload.storageKey,
        storageProvider: upload.storageProvider,
        uploadUrl: upload.uploadUrl
      }
    });
  } catch (error) {
    return assetErrorResponse(error);
  }
}
