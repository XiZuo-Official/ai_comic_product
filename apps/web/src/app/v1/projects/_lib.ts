import type { Project } from "@ai-comic/projects";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function requireProjectsUserId(): Promise<string | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return userId;
}

export function projectResponse(project: Project) {
  return {
    id: project.id,
    createdAt: project.createdAt.toISOString(),
    description: project.description,
    name: project.name,
    ownerId: project.ownerId,
    updatedAt: project.updatedAt.toISOString()
  };
}

export function errorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid project request" }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Project request failed";
  const status = message === "Project not found" ? 404 : 400;

  return NextResponse.json({ error: message }, { status });
}

export function isRouteResponse(value: string | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
