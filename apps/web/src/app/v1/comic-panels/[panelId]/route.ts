import { updateComicPanel } from "@ai-comic/comic-studio";
import { NextResponse } from "next/server";

import { comicPageDetailResponse, comicStudioErrorResponse, isRouteResponse, requireComicStudioUserId } from "../../comic-pages/_lib";

const updateComicPanelFields = new Set(["assetId", "height", "metadata", "orderIndex", "width", "x", "y"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ panelId: string }> }) {
  const userId = await requireComicStudioUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const [{ panelId }, body] = await Promise.all([params, request.json()]);
    const unknownKeys = Object.keys(body).filter((key) => !updateComicPanelFields.has(key));

    if (unknownKeys.length > 0) {
      return NextResponse.json({ error: `Unknown comic panel fields: ${unknownKeys.join(", ")}` }, { status: 400 });
    }

    const page = await updateComicPanel(userId, panelId, {
      assetId: body.assetId,
      height: body.height,
      metadata: body.metadata,
      orderIndex: body.orderIndex,
      width: body.width,
      x: body.x,
      y: body.y
    });

    return NextResponse.json({ page: comicPageDetailResponse(page) });
  } catch (error) {
    return comicStudioErrorResponse(error);
  }
}
