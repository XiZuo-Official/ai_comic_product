import { getIdeaThread } from "@ai-comic/ideas";
import { NextResponse } from "next/server";

import { ideaMessageResponse, ideasErrorResponse, ideaThreadResponse, isRouteResponse, requireIdeasUserId } from "../_lib";

export async function GET(_request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const userId = await requireIdeasUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { threadId } = await params;
    const detail = await getIdeaThread(userId, threadId);

    return NextResponse.json({
      messages: detail.messages.map(ideaMessageResponse),
      thread: ideaThreadResponse(detail.thread)
    });
  } catch (error) {
    return ideasErrorResponse(error);
  }
}
