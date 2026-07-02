import {
  db,
  projectSettings,
  projectVersions,
  projects,
  type ProjectRow,
  type ProjectSettingsRow,
  type ProjectVersionRow
} from "@ai-comic/db";
import { and, desc, eq, isNull } from "drizzle-orm";

import type { Project, ProjectSettings, ProjectVersion, ProjectVersionAction } from "../api";
import { shouldCreateProjectVersion } from "../domain/project";

export function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    createdAt: row.createdAt,
    description: row.description,
    name: row.name,
    ownerId: row.ownerId,
    updatedAt: row.updatedAt
  };
}

export function toProjectSettings(row: ProjectSettingsRow): ProjectSettings {
  return {
    id: row.id,
    createdAt: row.createdAt,
    projectId: row.projectId,
    updatedAt: row.updatedAt
  };
}

export function toProjectVersion(row: ProjectVersionRow): ProjectVersion {
  return {
    id: row.id,
    action: row.action as ProjectVersionAction,
    createdAt: row.createdAt,
    projectId: row.projectId,
    snapshot: row.snapshot
  };
}

function snapshot(project: ProjectRow): string {
  return JSON.stringify({
    id: project.id,
    deletedAt: project.deletedAt?.toISOString() ?? null,
    description: project.description,
    name: project.name,
    ownerId: project.ownerId
  });
}

export async function listActiveProjectRows(ownerId: string): Promise<Project[]> {
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.ownerId, ownerId), isNull(projects.deletedAt)))
    .orderBy(desc(projects.updatedAt));

  return rows.map(toProject);
}

export async function findActiveProjectRow(ownerId: string, projectId: string): Promise<Project | null> {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.ownerId, ownerId), eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  return project ? toProject(project) : null;
}

export async function createProjectRow(input: {
  description: string | null;
  name: string;
  ownerId: string;
}): Promise<Project> {
  const [project] = await db
    .insert(projects)
    .values({
      description: input.description,
      name: input.name,
      ownerId: input.ownerId
    })
    .returning();

  await db.insert(projectSettings).values({ projectId: project.id });
  await recordProjectVersion(project, "created");

  return toProject(project);
}

export async function updateProjectMetadataRow(input: {
  description?: string | null;
  name?: string;
  ownerId: string;
  projectId: string;
}): Promise<Project> {
  const [project] = await db
    .update(projects)
    .set({
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      updatedAt: new Date()
    })
    .where(and(eq(projects.ownerId, input.ownerId), eq(projects.id, input.projectId), isNull(projects.deletedAt)))
    .returning();

  if (!project) {
    throw new Error("Project not found");
  }

  return toProject(project);
}

export async function archiveProjectRow(ownerId: string, projectId: string): Promise<void> {
  const [project] = await db
    .update(projects)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(projects.ownerId, ownerId), eq(projects.id, projectId), isNull(projects.deletedAt)))
    .returning();

  if (!project) {
    throw new Error("Project not found");
  }

  await recordProjectVersion(project, "archived");
}

export async function listProjectVersionRows(ownerId: string, projectId: string): Promise<ProjectVersion[]> {
  const project = await findActiveProjectRow(ownerId, projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const rows = await db
    .select()
    .from(projectVersions)
    .where(eq(projectVersions.projectId, projectId))
    .orderBy(desc(projectVersions.createdAt));

  return rows.map(toProjectVersion);
}

async function recordProjectVersion(project: ProjectRow, action: ProjectVersionAction): Promise<void> {
  if (!shouldCreateProjectVersion(action)) {
    return;
  }

  await db.insert(projectVersions).values({
    action,
    projectId: project.id,
    snapshot: snapshot(project)
  });
}
