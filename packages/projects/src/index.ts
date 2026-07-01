import { db, projectSettings, projectVersions, projects, type ProjectRow } from "@ai-comic/db";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";

const projectNameSchema = z.string().trim().min(1, "Project name is required").max(120, "Project name is too long");

export type Project = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.ownerId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function snapshot(project: ProjectRow): string {
  return JSON.stringify({
    id: project.id,
    name: project.name,
    ownerId: project.ownerId,
    deletedAt: project.deletedAt?.toISOString() ?? null
  });
}

export async function listProjects(ownerId: string): Promise<Project[]> {
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.ownerId, ownerId), isNull(projects.deletedAt)))
    .orderBy(desc(projects.updatedAt));

  return rows.map(toProject);
}

export async function getProject(ownerId: string, projectId: string): Promise<Project | null> {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.ownerId, ownerId), eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  return project ? toProject(project) : null;
}

export async function createProject(ownerId: string, nameInput: string): Promise<Project> {
  const name = projectNameSchema.parse(nameInput);

  const [project] = await db
    .insert(projects)
    .values({ ownerId, name })
    .returning();

  await db.insert(projectSettings).values({ projectId: project.id });
  await db.insert(projectVersions).values({
    projectId: project.id,
    action: "created",
    snapshot: snapshot(project)
  });

  return toProject(project);
}

export async function renameProject(ownerId: string, projectId: string, nameInput: string): Promise<Project> {
  const name = projectNameSchema.parse(nameInput);

  const [project] = await db
    .update(projects)
    .set({ name, updatedAt: new Date() })
    .where(and(eq(projects.ownerId, ownerId), eq(projects.id, projectId), isNull(projects.deletedAt)))
    .returning();

  if (!project) {
    throw new Error("Project not found");
  }

  await db.insert(projectVersions).values({
    projectId: project.id,
    action: "renamed",
    snapshot: snapshot(project)
  });

  return toProject(project);
}

export async function deleteProject(ownerId: string, projectId: string): Promise<void> {
  const [project] = await db
    .update(projects)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(projects.ownerId, ownerId), eq(projects.id, projectId), isNull(projects.deletedAt)))
    .returning();

  if (!project) {
    throw new Error("Project not found");
  }

  await db.insert(projectVersions).values({
    projectId: project.id,
    action: "deleted",
    snapshot: snapshot(project)
  });
}
