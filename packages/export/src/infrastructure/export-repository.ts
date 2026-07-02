import {
  db,
  exportArtifacts,
  exportJobs,
  type ExportArtifactRow,
  type ExportJobRow
} from "@ai-comic/db";
import { and, desc, eq } from "drizzle-orm";

import type {
  ExportArtifact,
  ExportFormat,
  ExportJob,
  ExportJobStatus,
  ExportJobWithArtifact,
  ExportSettings,
  ExportSourceSnapshot
} from "../api";

export function toExportJob(row: ExportJobRow): ExportJob {
  return {
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    errorMessage: row.errorMessage,
    format: row.format as ExportFormat,
    id: row.id,
    ownerId: row.ownerId,
    projectId: row.projectId,
    settings: row.settings as ExportSettings,
    sourceSnapshot: row.sourceSnapshot as ExportSourceSnapshot | null,
    status: row.status as ExportJobStatus,
    updatedAt: row.updatedAt
  };
}

export function toExportArtifact(row: ExportArtifactRow): ExportArtifact {
  return {
    createdAt: row.createdAt,
    exportJobId: row.exportJobId,
    fileName: row.fileName,
    fileSize: row.fileSize,
    id: row.id,
    mimeType: row.mimeType,
    ownerId: row.ownerId,
    projectId: row.projectId,
    storageKey: row.storageKey,
    storageProvider: row.storageProvider as "local"
  };
}

export async function createExportJobRow(input: {
  format: ExportFormat;
  ownerId: string;
  projectId: string;
  settings: ExportSettings;
}): Promise<ExportJob> {
  const [job] = await db
    .insert(exportJobs)
    .values({
      format: input.format,
      ownerId: input.ownerId,
      projectId: input.projectId,
      settings: input.settings,
      status: "queued"
    })
    .returning();

  return toExportJob(job);
}

export async function updateExportJobRow(input: {
  completedAt?: Date | null;
  errorMessage?: string | null;
  exportJobId: string;
  ownerId: string;
  sourceSnapshot?: ExportSourceSnapshot | null;
  status: ExportJobStatus;
}): Promise<ExportJob> {
  const [job] = await db
    .update(exportJobs)
    .set({
      ...(input.completedAt !== undefined ? { completedAt: input.completedAt } : {}),
      ...(input.errorMessage !== undefined ? { errorMessage: input.errorMessage } : {}),
      ...(input.sourceSnapshot !== undefined ? { sourceSnapshot: input.sourceSnapshot } : {}),
      status: input.status,
      updatedAt: new Date()
    })
    .where(and(eq(exportJobs.ownerId, input.ownerId), eq(exportJobs.id, input.exportJobId)))
    .returning();

  if (!job) {
    throw new Error("Export job not found");
  }

  return toExportJob(job);
}

export async function createExportArtifactRow(input: {
  exportJobId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  ownerId: string;
  projectId: string;
  storageKey: string;
  storageProvider: "local";
}): Promise<ExportArtifact> {
  const [artifact] = await db
    .insert(exportArtifacts)
    .values(input)
    .returning();

  return toExportArtifact(artifact);
}

export async function findExportArtifactRow(ownerId: string, exportJobId: string): Promise<ExportArtifact | null> {
  const [artifact] = await db
    .select()
    .from(exportArtifacts)
    .where(and(eq(exportArtifacts.ownerId, ownerId), eq(exportArtifacts.exportJobId, exportJobId)))
    .limit(1);

  return artifact ? toExportArtifact(artifact) : null;
}

export async function findExportJobRow(ownerId: string, exportJobId: string): Promise<ExportJobWithArtifact | null> {
  const [job] = await db
    .select()
    .from(exportJobs)
    .where(and(eq(exportJobs.ownerId, ownerId), eq(exportJobs.id, exportJobId)))
    .limit(1);

  if (!job) {
    return null;
  }

  return {
    ...toExportJob(job),
    artifact: await findExportArtifactRow(ownerId, job.id)
  };
}

export async function listExportJobRows(ownerId: string, projectId: string): Promise<ExportJobWithArtifact[]> {
  const rows = await db
    .select()
    .from(exportJobs)
    .where(and(eq(exportJobs.ownerId, ownerId), eq(exportJobs.projectId, projectId)))
    .orderBy(desc(exportJobs.createdAt));

  return Promise.all(
    rows.map(async (row) => ({
      ...toExportJob(row),
      artifact: await findExportArtifactRow(ownerId, row.id)
    }))
  );
}
