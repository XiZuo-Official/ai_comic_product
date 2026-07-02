import { listAiJobEvents } from "@ai-comic/ai";
import { NextResponse } from "next/server";

import { aiErrorResponse, aiJobEventResponse, isRouteResponse, requireAiUserId } from "../../_lib";

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const userId = await requireAiUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { jobId } = await params;
    const events = await listAiJobEvents(userId, jobId);

    return NextResponse.json({ events: events.map(aiJobEventResponse) });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
