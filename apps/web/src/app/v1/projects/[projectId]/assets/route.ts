import { listProjectAssets } from "@ai-comic/assets";
import { NextResponse } from "next/server";

import { assetErrorResponse, assetResponse, isRouteResponse, requireAssetsUserId } from "../../../assets/_lib";

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const userId = await requireAssetsUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { projectId } = await params;
    const assets = await listProjectAssets(userId, projectId);

    return NextResponse.json({ assets: assets.map(assetResponse) });
  } catch (error) {
    return assetErrorResponse(error);
  }
}
