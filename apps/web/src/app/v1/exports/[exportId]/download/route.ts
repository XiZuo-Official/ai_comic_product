import { downloadExportArtifact } from "@ai-comic/export";
import { NextResponse } from "next/server";

import { exportErrorResponse, isRouteResponse, requireExportUserId } from "../../_lib";

export async function GET(_request: Request, { params }: { params: Promise<{ exportId: string }> }) {
  const userId = await requireExportUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { exportId } = await params;
    const artifact = await downloadExportArtifact(userId, exportId);
    const body = new ArrayBuffer(artifact.body.byteLength);
    new Uint8Array(body).set(artifact.body);

    return new NextResponse(body, {
      headers: {
        "Content-Disposition": `attachment; filename="${artifact.fileName}"`,
        "Content-Type": artifact.mimeType
      }
    });
  } catch (error) {
    return exportErrorResponse(error);
  }
}
