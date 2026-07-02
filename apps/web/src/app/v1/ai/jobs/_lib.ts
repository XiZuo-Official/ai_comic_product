import type { AiJob, AiJobEvent } from "@ai-comic/ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function requireAiUserId(): Promise<string | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return userId;
}

export function aiJobResponse(job: AiJob) {
  return {
    id: job.id,
    createdAt: job.createdAt.toISOString(),
    error: job.error,
    estimatedCost: job.estimatedCost,
    progress: job.progress,
    resultRef: typeof job.result?.resultRef === "string" ? job.result.resultRef : null,
    status: job.status,
    type: job.type,
    updatedAt: job.updatedAt.toISOString()
  };
}

export function aiJobEventResponse(event: AiJobEvent) {
  return {
    id: event.id,
    createdAt: event.createdAt.toISOString(),
    message: event.message,
    metadata: event.metadata,
    status: event.status,
    type: event.type
  };
}

export function aiErrorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid AI job request" }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "AI job request failed";
  const status = message === "AI job not found" ? 404 : message === "Insufficient credits" ? 402 : 400;

  return NextResponse.json({ error: message }, { status });
}

export function isRouteResponse(value: string | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
