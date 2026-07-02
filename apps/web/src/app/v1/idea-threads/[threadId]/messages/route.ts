import { sendIdeaMessage } from "@ai-comic/ideas";
import { NextResponse } from "next/server";

import {
  ideaContextSnapshotResponse,
  ideaMessageResponse,
  ideasErrorResponse,
  isRouteResponse,
  requireIdeasUserId
} from "../../_lib";

export async function POST(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const userId = await requireIdeasUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const [{ threadId }, body] = await Promise.all([params, request.json()]);
    const result = await sendIdeaMessage(userId, threadId, {
      content: body.content,
      idempotencyKey: body.idempotencyKey
    });

    return NextResponse.json(
      {
        aiJobId: result.aiJobId,
        aiJobStatus: result.aiJobStatus,
        assistantMessage: ideaMessageResponse(result.assistantMessage),
        contextSnapshot: ideaContextSnapshotResponse(result.contextSnapshot),
        userMessage: ideaMessageResponse(result.userMessage)
      },
      { status: 201 }
    );
  } catch (error) {
    return ideasErrorResponse(error);
  }
}
