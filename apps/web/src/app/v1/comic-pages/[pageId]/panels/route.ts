import { createComicPanel } from "@ai-comic/comic-studio";
import { NextResponse } from "next/server";

import { comicPageDetailResponse, comicStudioErrorResponse, isRouteResponse, requireComicStudioUserId } from "../../_lib";

const createComicPanelFields = new Set(["assetId", "height", "metadata", "orderIndex", "width", "x", "y"]);

export async function POST(request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const userId = await requireComicStudioUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const [{ pageId }, body] = await Promise.all([params, request.json()]);
    const unknownKeys = Object.keys(body).filter((key) => !createComicPanelFields.has(key));

    if (unknownKeys.length > 0) {
      return NextResponse.json({ error: `Unknown comic panel fields: ${unknownKeys.join(", ")}` }, { status: 400 });
    }

    const page = await createComicPanel(userId, {
      assetId: body.assetId,
      height: body.height,
      metadata: body.metadata,
      orderIndex: body.orderIndex,
      pageId,
      width: body.width,
      x: body.x,
      y: body.y
    });

    return NextResponse.json({ page: comicPageDetailResponse(page) }, { status: 201 });
  } catch (error) {
    return comicStudioErrorResponse(error);
  }
}
