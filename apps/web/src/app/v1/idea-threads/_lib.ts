import type { IdeaContextSnapshot, IdeaMessage, IdeaThread } from "@ai-comic/ideas";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function requireIdeasUserId(): Promise<string | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return userId;
}

export function ideaThreadResponse(thread: IdeaThread) {
  return {
    id: thread.id,
    createdAt: thread.createdAt.toISOString(),
    ownerId: thread.ownerId,
    projectId: thread.projectId,
    status: thread.status,
    title: thread.title,
    updatedAt: thread.updatedAt.toISOString()
  };
}

export function ideaMessageResponse(message: IdeaMessage) {
  return {
    id: message.id,
    aiJobId: message.aiJobId,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    error: message.error,
    metadata: message.metadata,
    role: message.role,
    status: message.status,
    threadId: message.threadId,
    updatedAt: message.updatedAt.toISOString()
  };
}

export function ideaContextSnapshotResponse(snapshot: IdeaContextSnapshot) {
  return {
    id: snapshot.id,
    aiJobId: snapshot.aiJobId,
    context: snapshot.context,
    createdAt: snapshot.createdAt.toISOString(),
    projectId: snapshot.projectId,
    threadId: snapshot.threadId
  };
}

export function ideasErrorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid idea chat request" }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Idea chat request failed";
  const status =
    message === "Project not found" || message === "Idea thread not found"
      ? 404
      : message === "Insufficient credits"
        ? 402
        : 400;

  return NextResponse.json({ error: message }, { status });
}

export function isRouteResponse(value: string | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
