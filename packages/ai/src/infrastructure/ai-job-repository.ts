import {
  aiJobs,
  aiJobSteps,
  aiPromptTemplates,
  aiProviderCalls,
  db,
  type AiJobRow,
  type AiJobStepRow,
  type AiPromptTemplateRow
} from "@ai-comic/db";
import { and, desc, eq } from "drizzle-orm";

import type { AiJob, AiJobStatus, AiJobStep, AiJobStepStatus, AiJsonObject, AiPromptTemplate } from "../api";

export function toAiJob(row: AiJobRow): AiJob {
  return {
    id: row.id,
    createdAt: row.createdAt,
    creditReservationId: row.creditReservationId,
    error: row.error,
    estimatedCost: row.estimatedCost,
    idempotencyKey: row.idempotencyKey,
    input: row.input,
    ownerId: row.ownerId,
    progress: row.progress,
    prompt: row.prompt,
    promptTemplateKey: row.promptTemplateKey,
    promptTemplateVersion: row.promptTemplateVersion,
    result: row.result,
    status: row.status as AiJobStatus,
    type: row.jobType as AiJob["type"],
    updatedAt: row.updatedAt
  };
}

export function toAiJobStep(row: AiJobStepRow): AiJobStep {
  return {
    id: row.id,
    createdAt: row.createdAt,
    jobId: row.jobId,
    message: row.message,
    metadata: row.metadata,
    status: row.status as AiJobStepStatus,
    stepName: row.stepName,
    updatedAt: row.updatedAt
  };
}

export function toPromptTemplate(row: AiPromptTemplateRow): AiPromptTemplate {
  return {
    id: row.id,
    createdAt: row.createdAt,
    metadata: row.metadata,
    purpose: row.purpose,
    status: row.status as AiPromptTemplate["status"],
    systemPrompt: row.systemPrompt,
    templateKey: row.templateKey,
    updatedAt: row.updatedAt,
    version: row.version
  };
}

export async function findAiJobById(ownerId: string, jobId: string): Promise<AiJob | null> {
  const [job] = await db.select().from(aiJobs).where(and(eq(aiJobs.ownerId, ownerId), eq(aiJobs.id, jobId))).limit(1);

  return job ? toAiJob(job) : null;
}

export async function findAiJobByIdempotencyKey(ownerId: string, idempotencyKey: string): Promise<AiJob | null> {
  const [job] = await db
    .select()
    .from(aiJobs)
    .where(and(eq(aiJobs.ownerId, ownerId), eq(aiJobs.idempotencyKey, idempotencyKey)))
    .limit(1);

  return job ? toAiJob(job) : null;
}

export async function createAiJobRow(input: {
  creditReservationId: string;
  estimatedCost: number;
  idempotencyKey: string | null;
  input: AiJsonObject;
  ownerId: string;
  prompt: string;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  type: AiJob["type"];
}): Promise<AiJob> {
  const [job] = await db
    .insert(aiJobs)
    .values({
      creditReservationId: input.creditReservationId,
      estimatedCost: input.estimatedCost,
      idempotencyKey: input.idempotencyKey,
      input: input.input,
      jobType: input.type,
      ownerId: input.ownerId,
      prompt: input.prompt,
      promptTemplateKey: input.promptTemplateKey,
      promptTemplateVersion: input.promptTemplateVersion,
      status: "queued"
    })
    .returning();

  return toAiJob(job);
}

export async function updateAiJobStatusRow(input: {
  error?: string | null;
  jobId: string;
  ownerId: string;
  progress: number;
  result?: AiJsonObject | null;
  status: AiJobStatus;
}): Promise<AiJob> {
  const [job] = await db
    .update(aiJobs)
    .set({
      error: input.error,
      progress: input.progress,
      result: input.result,
      status: input.status,
      updatedAt: new Date()
    })
    .where(and(eq(aiJobs.ownerId, input.ownerId), eq(aiJobs.id, input.jobId)))
    .returning();

  if (!job) {
    throw new Error("AI job not found");
  }

  return toAiJob(job);
}

export async function createAiJobStepRow(input: {
  jobId: string;
  message?: string | null;
  metadata?: AiJsonObject;
  status: AiJobStepStatus;
  stepName: string;
}): Promise<AiJobStep> {
  const [step] = await db
    .insert(aiJobSteps)
    .values({
      jobId: input.jobId,
      message: input.message,
      metadata: input.metadata ?? {},
      status: input.status,
      stepName: input.stepName
    })
    .returning();

  return toAiJobStep(step);
}

export async function listAiJobStepRows(ownerId: string, jobId: string): Promise<AiJobStep[]> {
  const job = await findAiJobById(ownerId, jobId);

  if (!job) {
    throw new Error("AI job not found");
  }

  const rows = await db.select().from(aiJobSteps).where(eq(aiJobSteps.jobId, jobId)).orderBy(aiJobSteps.createdAt);

  return rows.map(toAiJobStep);
}

export async function ensurePromptTemplateRow(input: {
  purpose: string;
  systemPrompt: string;
  templateKey: string;
  version: number;
}): Promise<AiPromptTemplate> {
  const [existing] = await db
    .select()
    .from(aiPromptTemplates)
    .where(and(eq(aiPromptTemplates.templateKey, input.templateKey), eq(aiPromptTemplates.version, input.version)))
    .limit(1);

  if (existing) {
    return toPromptTemplate(existing);
  }

  const [template] = await db
    .insert(aiPromptTemplates)
    .values({
      purpose: input.purpose,
      systemPrompt: input.systemPrompt,
      templateKey: input.templateKey,
      version: input.version
    })
    .returning();

  return toPromptTemplate(template);
}

export async function createProviderCallRow(input: {
  jobId: string;
  operation: string;
  providerId: string;
  requestMetadata: AiJsonObject;
  responseMetadata?: AiJsonObject | null;
  error?: string | null;
  status: "succeeded" | "failed";
  stepId?: string | null;
}): Promise<void> {
  await db.insert(aiProviderCalls).values({
    completedAt: new Date(),
    error: input.error,
    jobId: input.jobId,
    operation: input.operation,
    providerId: input.providerId,
    requestMetadata: input.requestMetadata,
    responseMetadata: input.responseMetadata,
    status: input.status,
    stepId: input.stepId
  });
}
