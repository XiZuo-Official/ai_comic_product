import { createProjectExport } from "@ai-comic/export";
import { NextResponse } from "next/server";

import { exportErrorResponse, exportJobResponse, isRouteResponse, requireExportUserId } from "./_lib";

const createExportFields = new Set(["format", "includeMetadata", "projectId"]);

export async function POST(request: Request) {
  const userId = await requireExportUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const body = await request.json();
    const unknownKeys = Object.keys(body).filter((key) => !createExportFields.has(key));

    if (unknownKeys.length > 0) {
      return NextResponse.json({ error: `Unknown export fields: ${unknownKeys.join(", ")}` }, { status: 400 });
    }

    const exportJob = await createProjectExport(userId, {
      format: body.format,
      includeMetadata: body.includeMetadata,
      projectId: body.projectId
    });

    return NextResponse.json({ export: exportJobResponse(exportJob) }, { status: 201 });
  } catch (error) {
    return exportErrorResponse(error);
  }
}
