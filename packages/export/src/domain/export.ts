import { z } from "zod";

import type { CreateExportInput, ExportFormat, ExportJobStatus, ExportSettings } from "../api";

export const exportFormats = ["html"] as const;
export const exportJobStatuses = ["queued", "processing", "completed", "failed"] as const;

export const createExportSchema = z
  .object({
    format: z.enum(exportFormats).optional(),
    includeMetadata: z.coerce.boolean().optional(),
    projectId: z.string().trim().min(1, "Project id is required")
  })
  .strict();

export function parseCreateExportInput(input: CreateExportInput): CreateExportInput {
  return createExportSchema.parse(input);
}

export function normalizeExportSettings(input: CreateExportInput): ExportSettings {
  return {
    format: input.format ?? "html",
    includeMetadata: input.includeMetadata ?? true
  };
}

export function assertExportStatus(value: string): asserts value is ExportJobStatus {
  if (!exportJobStatuses.includes(value as ExportJobStatus)) {
    throw new Error("Invalid export status");
  }
}

export function assertExportFormat(value: string): asserts value is ExportFormat {
  if (!exportFormats.includes(value as ExportFormat)) {
    throw new Error("Invalid export format");
  }
}

export function exportFileName(input: { createdAt: Date; projectName: string }): string {
  const safeName = input.projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const date = input.createdAt.toISOString().slice(0, 10);

  return `${safeName || "comic"}-${date}.html`;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}
