import { listProjectExports } from "@ai-comic/export";
import { NextResponse } from "next/server";

import { exportErrorResponse, exportJobResponse, isRouteResponse, requireExportUserId } from "../../../exports/_lib";

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const userId = await requireExportUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { projectId } = await params;
    const exports = await listProjectExports(userId, projectId);

    return NextResponse.json({ exports: exports.map(exportJobResponse) });
  } catch (error) {
    return exportErrorResponse(error);
  }
}
