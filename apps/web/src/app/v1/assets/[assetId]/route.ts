import { deleteAsset, getAsset, updateAsset } from "@ai-comic/assets";
import { NextResponse } from "next/server";

import { assetErrorResponse, assetResponse, isRouteResponse, requireAssetsUserId } from "../_lib";

const updateAssetFields = new Set(["description", "displayName", "metadata", "status", "tags"]);

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  const userId = await requireAssetsUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { assetId } = await params;
    const asset = await getAsset(userId, assetId);

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ asset: assetResponse(asset) });
  } catch (error) {
    return assetErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  const userId = await requireAssetsUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const [{ assetId }, body] = await Promise.all([params, request.json()]);
    const unknownKeys = Object.keys(body).filter((key) => !updateAssetFields.has(key));

    if (unknownKeys.length > 0) {
      return NextResponse.json({ error: `Unknown asset fields: ${unknownKeys.join(", ")}` }, { status: 400 });
    }

    const asset = await updateAsset(userId, assetId, {
      description: body.description,
      displayName: body.displayName,
      metadata: body.metadata,
      status: body.status,
      tags: body.tags
    });

    return NextResponse.json({ asset: assetResponse(asset) });
  } catch (error) {
    return assetErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  const userId = await requireAssetsUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { assetId } = await params;
    await deleteAsset(userId, assetId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return assetErrorResponse(error);
  }
}
