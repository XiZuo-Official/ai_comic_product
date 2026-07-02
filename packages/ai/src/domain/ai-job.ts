import { z } from "zod";

import type { AiJobStatus, AiJobType, CreateAiJobInput } from "../api";

export const aiJobTypes = ["text_generation", "image_generation"] as const;
export const aiJobStatuses = ["queued", "running", "succeeded", "failed", "canceled"] as const;

export const aiJsonObjectSchema = z.record(z.unknown());

export const createAiJobSchema = z
  .object({
    idempotencyKey: z.string().trim().min(1).max(160).optional().nullable(),
    input: aiJsonObjectSchema.optional(),
    prompt: z.string().trim().min(1, "Prompt is required").max(4000, "Prompt is too long"),
    promptTemplateKey: z.string().trim().min(1).max(120).optional().nullable(),
    promptTemplateVersion: z.coerce.number().int().positive().optional().nullable(),
    type: z.enum(aiJobTypes)
  })
  .strict();

const allowedTransitions: Record<AiJobStatus, AiJobStatus[]> = {
  canceled: [],
  failed: [],
  queued: ["running", "canceled", "failed"],
  running: ["succeeded", "failed", "canceled"],
  succeeded: []
};

export function parseCreateAiJobInput(input: CreateAiJobInput): CreateAiJobInput {
  return createAiJobSchema.parse(input);
}

export function assertAiJobTransition(current: AiJobStatus, next: AiJobStatus): void {
  if (current === next) {
    return;
  }

  if (!allowedTransitions[current].includes(next)) {
    throw new Error(`Cannot transition AI job from ${current} to ${next}`);
  }
}

export function estimateAiJobCredits(type: AiJobType): number {
  const estimates: Record<AiJobType, number> = {
    image_generation: 20,
    text_generation: 5
  };

  return estimates[type];
}

export function defaultPromptTemplateForType(type: AiJobType): { templateKey: string; version: number } {
  const templates: Record<AiJobType, { templateKey: string; version: number }> = {
    image_generation: { templateKey: "mvp.image_generation", version: 1 },
    text_generation: { templateKey: "mvp.text_generation", version: 1 }
  };

  return templates[type];
}

export function normalizeAiJobInput(input?: Record<string, unknown>): Record<string, unknown> {
  return input ?? {};
}

export function normalizeAiIdempotencyKey(value?: string | null): string | null {
  const normalized = value?.trim();

  return normalized && normalized.length > 0 ? normalized : null;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "AI job failed";
}
