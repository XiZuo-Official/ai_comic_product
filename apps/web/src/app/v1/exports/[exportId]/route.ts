import { getExportJob } from "@ai-comic/export";
import { NextResponse } from "next/server";

import { exportErrorResponse, exportJobResponse, isRouteResponse, requireExportUserId } from "../_lib";

export async function GET(_request: Request, { params }: { params: Promise<{ exportId: string }> }) {
  const userId = await requireExportUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { exportId } = await params;
    const exportJob = await getExportJob(userId, exportId);

    if (!exportJob) {
      return NextResponse.json({ error: "Export job not found" }, { status: 404 });
    }

    return NextResponse.json({ export: exportJobResponse(exportJob) });
  } catch (error) {
    return exportErrorResponse(error);
  }
}
