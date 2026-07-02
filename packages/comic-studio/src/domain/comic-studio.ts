import { z } from "zod";

import type {
  ComicLayoutVersionAction,
  ComicMetadata,
  CreateComicBubbleInput,
  CreateComicPageInput,
  CreateComicPanelInput,
  UpdateComicBubbleInput,
  UpdateComicPageInput,
  UpdateComicPanelInput
} from "../api";

const positionSchema = z.coerce.number().min(0, "Position must be at least 0").max(100, "Position must be at most 100");
const sizeSchema = z.coerce.number().min(1, "Size must be at least 1").max(100, "Size must be at most 100");

export const comicMetadataSchema = z.record(z.unknown()).default({});

const comicLayoutBoxShape = {
  height: sizeSchema,
  width: sizeSchema,
  x: positionSchema,
  y: positionSchema
};

export const comicLayoutBoxSchema = z
  .object({
    ...comicLayoutBoxShape
  })
  .strict()
  .refine((value) => value.x + value.width <= 100, { message: "Layout width exceeds canvas bounds" })
  .refine((value) => value.y + value.height <= 100, { message: "Layout height exceeds canvas bounds" });

export const comicPageTitleSchema = z.string().trim().min(1, "Page title is required").max(120, "Page title is too long");

export const createComicPageSchema = z
  .object({
    metadata: comicMetadataSchema.optional(),
    projectId: z.string().trim().min(1, "Project id is required"),
    title: z.string().trim().max(120, "Page title is too long").optional().nullable()
  })
  .strict();

export const updateComicPageSchema = z
  .object({
    metadata: comicMetadataSchema.optional(),
    title: comicPageTitleSchema.optional().nullable()
  })
  .strict()
  .refine((value) => value.metadata !== undefined || value.title !== undefined, {
    message: "At least one page field is required"
  });

export const createComicPanelSchema = z
  .object({
    ...comicLayoutBoxShape,
    assetId: z.string().trim().min(1, "Asset id is required").optional().nullable(),
    metadata: comicMetadataSchema.optional(),
    orderIndex: z.coerce.number().int().min(0, "Order index must be at least 0").optional(),
    pageId: z.string().trim().min(1, "Page id is required")
  })
  .strict()
  .refine((value) => value.x + value.width <= 100, { message: "Layout width exceeds canvas bounds" })
  .refine((value) => value.y + value.height <= 100, { message: "Layout height exceeds canvas bounds" });

export const createComicBubbleSchema = z
  .object({
    ...comicLayoutBoxShape,
    metadata: comicMetadataSchema.optional(),
    orderIndex: z.coerce.number().int().min(0, "Order index must be at least 0").optional(),
    pageId: z.string().trim().min(1, "Page id is required"),
    panelId: z.string().trim().min(1, "Panel id is required").optional().nullable(),
    text: z.string().trim().min(1, "Bubble text is required").max(500, "Bubble text is too long")
  })
  .strict()
  .refine((value) => value.x + value.width <= 100, { message: "Layout width exceeds canvas bounds" })
  .refine((value) => value.y + value.height <= 100, { message: "Layout height exceeds canvas bounds" });

export const updateComicPanelSchema = z
  .object({
    assetId: z.string().trim().min(1, "Asset id is required").optional().nullable(),
    height: sizeSchema.optional(),
    metadata: comicMetadataSchema.optional(),
    orderIndex: z.coerce.number().int().min(0, "Order index must be at least 0").optional(),
    width: sizeSchema.optional(),
    x: positionSchema.optional(),
    y: positionSchema.optional()
  })
  .strict()
  .refine(
    (value) =>
      value.assetId !== undefined ||
      value.height !== undefined ||
      value.metadata !== undefined ||
      value.orderIndex !== undefined ||
      value.width !== undefined ||
      value.x !== undefined ||
      value.y !== undefined,
    { message: "At least one panel field is required" }
  );

export const updateComicBubbleSchema = z
  .object({
    height: sizeSchema.optional(),
    metadata: comicMetadataSchema.optional(),
    orderIndex: z.coerce.number().int().min(0, "Order index must be at least 0").optional(),
    panelId: z.string().trim().min(1, "Panel id is required").optional().nullable(),
    text: z.string().trim().min(1, "Bubble text is required").max(500, "Bubble text is too long").optional(),
    width: sizeSchema.optional(),
    x: positionSchema.optional(),
    y: positionSchema.optional()
  })
  .strict()
  .refine(
    (value) =>
      value.height !== undefined ||
      value.metadata !== undefined ||
      value.orderIndex !== undefined ||
      value.panelId !== undefined ||
      value.text !== undefined ||
      value.width !== undefined ||
      value.x !== undefined ||
      value.y !== undefined,
    { message: "At least one bubble field is required" }
  );

export function parseCreateComicPageInput(input: CreateComicPageInput): CreateComicPageInput {
  return createComicPageSchema.parse(input);
}

export function parseUpdateComicPageInput(input: UpdateComicPageInput): UpdateComicPageInput {
  return updateComicPageSchema.parse(input);
}

export function parseCreateComicPanelInput(input: CreateComicPanelInput): CreateComicPanelInput {
  return createComicPanelSchema.parse(input);
}

export function parseUpdateComicPanelInput(input: UpdateComicPanelInput): UpdateComicPanelInput {
  const parsed = updateComicPanelSchema.parse(input);

  assertPartialBoxWithinCanvas(parsed);

  return parsed;
}

export function parseCreateComicBubbleInput(input: CreateComicBubbleInput): CreateComicBubbleInput {
  return createComicBubbleSchema.parse(input);
}

export function parseUpdateComicBubbleInput(input: UpdateComicBubbleInput): UpdateComicBubbleInput {
  const parsed = updateComicBubbleSchema.parse(input);

  assertPartialBoxWithinCanvas(parsed);

  return parsed;
}

export function normalizeComicMetadata(value?: ComicMetadata): ComicMetadata {
  return value ?? {};
}

export function normalizeComicPageTitle(input: { pageNumber: number; title?: string | null }): string {
  const normalized = input.title?.trim();

  return normalized && normalized.length > 0 ? normalized : `Page ${input.pageNumber}`;
}

export function shouldCreateComicLayoutVersion(action: ComicLayoutVersionAction): boolean {
  return action === "page_created" || action === "page_updated" || action === "panel_updated" || action === "bubble_updated";
}

function assertPartialBoxWithinCanvas(value: Partial<{ height: number; width: number; x: number; y: number }>): void {
  if (value.x !== undefined && value.width !== undefined && value.x + value.width > 100) {
    throw new Error("Layout width exceeds canvas bounds");
  }

  if (value.y !== undefined && value.height !== undefined && value.y + value.height > 100) {
    throw new Error("Layout height exceeds canvas bounds");
  }
}
