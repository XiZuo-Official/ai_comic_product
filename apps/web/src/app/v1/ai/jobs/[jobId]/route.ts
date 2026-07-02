import { getAiJob } from "@ai-comic/ai";
import { NextResponse } from "next/server";

import { aiErrorResponse, aiJobResponse, isRouteResponse, requireAiUserId } from "../_lib";

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const userId = await requireAiUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { jobId } = await params;
    const job = await getAiJob(userId, jobId);

    if (!job) {
      return NextResponse.json({ error: "AI job not found" }, { status: 404 });
    }

    return NextResponse.json({ job: aiJobResponse(job) });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
