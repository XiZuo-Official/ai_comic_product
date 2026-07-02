import { getProject, updateProjectMetadata } from "@ai-comic/projects";
import { NextResponse } from "next/server";

import { errorResponse, isRouteResponse, projectResponse, requireProjectsUserId } from "../_lib";

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const userId = await requireProjectsUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { projectId } = await params;
    const project = await getProject(userId, projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project: projectResponse(project) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const userId = await requireProjectsUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const [{ projectId }, body] = await Promise.all([params, request.json()]);
    const allowedKeys = new Set(["name", "description"]);
    const unknownKeys = Object.keys(body).filter((key) => !allowedKeys.has(key));

    if (unknownKeys.length > 0) {
      return NextResponse.json({ error: `Unknown project fields: ${unknownKeys.join(", ")}` }, { status: 400 });
    }

    const project = await updateProjectMetadata(userId, projectId, {
      description: body.description,
      name: body.name
    });

    return NextResponse.json({ project: projectResponse(project) });
  } catch (error) {
    return errorResponse(error);
  }
}
