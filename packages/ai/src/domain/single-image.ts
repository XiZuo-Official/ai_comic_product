import { z } from "zod";

import type { GenerateSingleImageInput, SingleImageAspectRatio, SingleImageStyle } from "../api";

export const singleImageAspectRatios = ["1:1", "2:3", "3:2"] as const;
export const singleImageStyles = ["manga", "comic", "storybook"] as const;

export const generateSingleImageSchema = z
  .object({
    aspectRatio: z.enum(singleImageAspectRatios).optional().nullable(),
    idempotencyKey: z.string().trim().min(1).max(160).optional().nullable(),
    projectId: z.string().trim().min(1, "Project is required"),
    prompt: z.string().trim().min(1, "Prompt is required").max(2000, "Prompt is too long"),
    style: z.enum(singleImageStyles).optional().nullable()
  })
  .strict();

export type ParsedGenerateSingleImageInput = {
  aspectRatio: SingleImageAspectRatio;
  idempotencyKey?: string | null;
  projectId: string;
  prompt: string;
  style: SingleImageStyle;
};

export function parseGenerateSingleImageInput(input: GenerateSingleImageInput): ParsedGenerateSingleImageInput {
  const parsed = generateSingleImageSchema.parse(input);

  return {
    aspectRatio: parsed.aspectRatio ?? "1:1",
    idempotencyKey: parsed.idempotencyKey,
    projectId: parsed.projectId,
    prompt: parsed.prompt,
    style: parsed.style ?? "manga"
  };
}

export function singleImageSettingsLabel(input: { aspectRatio: SingleImageAspectRatio; style: SingleImageStyle }): string {
  return `${input.style} ${input.aspectRatio}`;
}

export function singleImageFileName(): string {
  return `single-image-${Date.now()}.png`;
}
