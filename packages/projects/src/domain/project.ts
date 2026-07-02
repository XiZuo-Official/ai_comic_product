import { z } from "zod";

import type { CreateProjectInput, ProjectVersionAction, UpdateProjectMetadataInput } from "../api";

export const projectNameSchema = z.string().trim().min(1, "Project name is required").max(120, "Project name is too long");

export const projectDescriptionSchema = z.string().trim().max(500, "Project description is too long").optional().nullable();

export const createProjectSchema = z
  .object({
    description: projectDescriptionSchema,
    name: projectNameSchema
  })
  .strict();

export const updateProjectMetadataSchema = z
  .object({
    description: projectDescriptionSchema,
    name: projectNameSchema.optional()
  })
  .strict()
  .refine((value) => value.name !== undefined || value.description !== undefined, {
    message: "At least one project metadata field is required"
  });

export function parseCreateProjectInput(input: CreateProjectInput): CreateProjectInput {
  return createProjectSchema.parse(input);
}

export function parseUpdateProjectMetadataInput(input: UpdateProjectMetadataInput): UpdateProjectMetadataInput {
  return updateProjectMetadataSchema.parse(input);
}

export function normalizeProjectDescription(value?: string | null): string | null {
  const normalized = value?.trim();

  return normalized && normalized.length > 0 ? normalized : null;
}

export function shouldCreateProjectVersion(action: ProjectVersionAction): boolean {
  return action === "created" || action === "archived";
}
