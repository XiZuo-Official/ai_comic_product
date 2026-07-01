import { z } from "zod";

import type { UpdateUserProfileInput } from "../api";

export const updateUserProfileSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required").max(80, "Display name must be 80 characters or fewer"),
  bio: z
    .string()
    .trim()
    .max(280, "Bio must be 280 characters or fewer")
    .optional()
    .nullable()
    .transform((value) => (value ? value : null))
});

export function parseUserProfileInput(input: UpdateUserProfileInput) {
  return updateUserProfileSchema.parse(input);
}

export function getDefaultDisplayName(displayName?: string | null): string {
  const normalized = displayName?.trim();

  return normalized && normalized.length > 0 ? normalized.slice(0, 80) : "Creator";
}
