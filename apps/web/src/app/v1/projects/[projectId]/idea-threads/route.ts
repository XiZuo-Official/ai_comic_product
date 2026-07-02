import { createIdeaThread, listProjectIdeaThreads } from "@ai-comic/ideas";
import { NextResponse } from "next/server";

import { ideaThreadResponse, ideasErrorResponse, isRouteResponse, requireIdeasUserId } from "../../../idea-threads/_lib";

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const userId = await requireIdeasUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { projectId } = await params;
    const threads = await listProjectIdeaThreads(userId, projectId);

    return NextResponse.json({ threads: threads.map(ideaThreadResponse) });
  } catch (error) {
    return ideasErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const userId = await requireIdeasUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const [{ projectId }, body] = await Promise.all([params, request.json()]);
    const thread = await createIdeaThread(userId, projectId, {
      title: body.title
    });

    return NextResponse.json({ thread: ideaThreadResponse(thread) }, { status: 201 });
  } catch (error) {
    return ideasErrorResponse(error);
  }
}
