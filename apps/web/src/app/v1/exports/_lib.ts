import type { ExportArtifact, ExportJobWithArtifact } from "@ai-comic/export";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function requireExportUserId(): Promise<string | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return userId;
}

export function exportArtifactResponse(artifact: ExportArtifact) {
  return {
    createdAt: artifact.createdAt.toISOString(),
    exportJobId: artifact.exportJobId,
    fileName: artifact.fileName,
    fileSize: artifact.fileSize,
    id: artifact.id,
    mimeType: artifact.mimeType,
    ownerId: artifact.ownerId,
    projectId: artifact.projectId,
    storageKey: artifact.storageKey,
    storageProvider: artifact.storageProvider
  };
}

export function exportJobResponse(job: ExportJobWithArtifact) {
  return {
    artifact: job.artifact ? exportArtifactResponse(job.artifact) : null,
    completedAt: job.completedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
    errorMessage: job.errorMessage,
    format: job.format,
    id: job.id,
    ownerId: job.ownerId,
    projectId: job.projectId,
    settings: job.settings,
    sourceSnapshot: job.sourceSnapshot,
    status: job.status,
    updatedAt: job.updatedAt.toISOString()
  };
}

export function exportErrorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid export request" }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Export request failed";
  const status =
    message === "Project not found" ||
    message === "Export job not found" ||
    message === "Export artifact is not ready" ||
    message.startsWith("Missing source page") ||
    message.startsWith("Missing asset")
      ? 404
      : message === "No comic pages found"
        ? 400
        : 400;

  return NextResponse.json({ error: message }, { status });
}

export function isRouteResponse(value: string | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
