import { z } from "zod";

import type { CreateIdeaThreadInput, IdeaMessage, SendIdeaMessageInput } from "../api";

export const ideaThreadStatuses = ["active", "archived"] as const;
export const ideaMessageRoles = ["user", "assistant"] as const;
export const ideaMessageStatuses = ["completed", "failed"] as const;

export const ideaMessageMaxLength = 4000;
export const ideaContextMaxLength = 8000;
export const defaultIdeaThreadTitle = "Untitled idea thread";

export const createIdeaThreadSchema = z
  .object({
    title: z.string().trim().max(120, "Thread title is too long").optional().nullable()
  })
  .strict();

export const sendIdeaMessageSchema = z
  .object({
    content: z.string().trim().min(1, "Message is required").max(ideaMessageMaxLength, "Message is too long"),
    idempotencyKey: z.string().trim().min(1).max(160).optional().nullable()
  })
  .strict();

export function parseCreateIdeaThreadInput(input: CreateIdeaThreadInput): CreateIdeaThreadInput {
  const parsed = createIdeaThreadSchema.parse(input);
  const title = parsed.title?.trim();

  return {
    title: title && title.length > 0 ? title : null
  };
}

export function parseSendIdeaMessageInput(input: SendIdeaMessageInput): SendIdeaMessageInput {
  return sendIdeaMessageSchema.parse(input);
}

export function normalizeIdeaThreadTitle(title?: string | null): string {
  const normalized = title?.trim();

  return normalized && normalized.length > 0 ? normalized : defaultIdeaThreadTitle;
}

export function titleFromMessage(content: string): string {
  const normalized = content.trim().replace(/\s+/g, " ");

  if (normalized.length <= 80) {
    return normalized;
  }

  return `${normalized.slice(0, 77)}...`;
}

export function ideaMessagesContext(messages: IdeaMessage[], limit = 12): Array<{ content: string; role: IdeaMessage["role"] }> {
  return messages
    .filter((message) => message.status === "completed")
    .slice(-limit)
    .map((message) => ({
      content: message.content,
      role: message.role
    }));
}

export function assertIdeaContextWithinLimit(context: Record<string, unknown>): void {
  const serialized = JSON.stringify(context);

  if (serialized.length > ideaContextMaxLength) {
    throw new Error("Idea context is too large");
  }
}
