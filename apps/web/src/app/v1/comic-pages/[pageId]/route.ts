import { getComicPage, listComicLayoutVersions, updateComicPage } from "@ai-comic/comic-studio";
import { NextResponse } from "next/server";

import {
  comicLayoutVersionResponse,
  comicPageDetailResponse,
  comicStudioErrorResponse,
  isRouteResponse,
  requireComicStudioUserId
} from "../_lib";

const updateComicPageFields = new Set(["metadata", "title"]);

export async function GET(_request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const userId = await requireComicStudioUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { pageId } = await params;
    const page = await getComicPage(userId, pageId);

    if (!page) {
      return NextResponse.json({ error: "Comic page not found" }, { status: 404 });
    }

    const versions = await listComicLayoutVersions(userId, pageId);

    return NextResponse.json({ page: comicPageDetailResponse(page), versions: versions.map(comicLayoutVersionResponse) });
  } catch (error) {
    return comicStudioErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const userId = await requireComicStudioUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const [{ pageId }, body] = await Promise.all([params, request.json()]);
    const unknownKeys = Object.keys(body).filter((key) => !updateComicPageFields.has(key));

    if (unknownKeys.length > 0) {
      return NextResponse.json({ error: `Unknown comic page fields: ${unknownKeys.join(", ")}` }, { status: 400 });
    }

    const page = await updateComicPage(userId, pageId, {
      metadata: body.metadata,
      title: body.title
    });

    return NextResponse.json({ page: comicPageDetailResponse(page) });
  } catch (error) {
    return comicStudioErrorResponse(error);
  }
}
