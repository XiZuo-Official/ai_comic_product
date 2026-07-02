import { createProject, listProjects } from "@ai-comic/projects";
import { NextResponse } from "next/server";

import { errorResponse, isRouteResponse, projectResponse, requireProjectsUserId } from "./_lib";

export async function GET() {
  const userId = await requireProjectsUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const projects = await listProjects(userId);

    return NextResponse.json({
      projects: projects.map(projectResponse)
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const userId = await requireProjectsUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const body = await request.json();
    const project = await createProject(userId, {
      description: body.description,
      name: body.name
    });

    return NextResponse.json({ project: projectResponse(project) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
