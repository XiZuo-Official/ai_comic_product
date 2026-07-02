import { getComicStudio } from "@ai-comic/comic-studio";
import { NextResponse } from "next/server";

import { comicPageResponse, comicStudioErrorResponse, isRouteResponse, requireComicStudioUserId } from "../../../comic-pages/_lib";

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const userId = await requireComicStudioUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { projectId } = await params;
    const studio = await getComicStudio(userId, projectId);

    return NextResponse.json({
      comicStudio: {
        pages: studio.pages.map(comicPageResponse),
        projectId: studio.projectId
      }
    });
  } catch (error) {
    return comicStudioErrorResponse(error);
  }
}
