import { updateComicBubble } from "@ai-comic/comic-studio";
import { NextResponse } from "next/server";

import { comicPageDetailResponse, comicStudioErrorResponse, isRouteResponse, requireComicStudioUserId } from "../../comic-pages/_lib";

const updateComicBubbleFields = new Set(["height", "metadata", "orderIndex", "panelId", "text", "width", "x", "y"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ bubbleId: string }> }) {
  const userId = await requireComicStudioUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const [{ bubbleId }, body] = await Promise.all([params, request.json()]);
    const unknownKeys = Object.keys(body).filter((key) => !updateComicBubbleFields.has(key));

    if (unknownKeys.length > 0) {
      return NextResponse.json({ error: `Unknown comic bubble fields: ${unknownKeys.join(", ")}` }, { status: 400 });
    }

    const page = await updateComicBubble(userId, bubbleId, {
      height: body.height,
      metadata: body.metadata,
      orderIndex: body.orderIndex,
      panelId: body.panelId,
      text: body.text,
      width: body.width,
      x: body.x,
      y: body.y
    });

    return NextResponse.json({ page: comicPageDetailResponse(page) });
  } catch (error) {
    return comicStudioErrorResponse(error);
  }
}
