import { createComicPage, listProjectComicPages } from "@ai-comic/comic-studio";
import { NextResponse } from "next/server";

import { comicPageDetailResponse, comicPageResponse, comicStudioErrorResponse, isRouteResponse, requireComicStudioUserId } from "../../../comic-pages/_lib";

const createComicPageFields = new Set(["metadata", "title"]);

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const userId = await requireComicStudioUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { projectId } = await params;
    const pages = await listProjectComicPages(userId, projectId);

    return NextResponse.json({ pages: pages.map(comicPageResponse) });
  } catch (error) {
    return comicStudioErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const userId = await requireComicStudioUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const [{ projectId }, body] = await Promise.all([params, request.json()]);
    const unknownKeys = Object.keys(body).filter((key) => !createComicPageFields.has(key));

    if (unknownKeys.length > 0) {
      return NextResponse.json({ error: `Unknown comic page fields: ${unknownKeys.join(", ")}` }, { status: 400 });
    }

    const page = await createComicPage(userId, {
      metadata: body.metadata,
      projectId,
      title: body.title
    });

    return NextResponse.json({ page: comicPageDetailResponse(page) }, { status: 201 });
  } catch (error) {
    return comicStudioErrorResponse(error);
  }
}
