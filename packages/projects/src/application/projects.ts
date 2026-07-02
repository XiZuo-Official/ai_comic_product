import type { CreateProjectInput, Project, ProjectVersion, UpdateProjectMetadataInput } from "../api";
import {
  normalizeProjectDescription,
  parseCreateProjectInput,
  parseUpdateProjectMetadataInput
} from "../domain/project";
import {
  archiveProjectRow,
  createProjectRow,
  findActiveProjectRow,
  listActiveProjectRows,
  listProjectVersionRows,
  updateProjectMetadataRow
} from "../infrastructure/project-repository";

export async function listProjects(ownerId: string): Promise<Project[]> {
  return listActiveProjectRows(ownerId);
}

export async function getProject(ownerId: string, projectId: string): Promise<Project | null> {
  return findActiveProjectRow(ownerId, projectId);
}

export async function createProject(ownerId: string, input: string | CreateProjectInput): Promise<Project> {
  const parsed = parseCreateProjectInput(typeof input === "string" ? { name: input } : input);

  return createProjectRow({
    description: normalizeProjectDescription(parsed.description),
    name: parsed.name,
    ownerId
  });
}

export async function updateProjectMetadata(ownerId: string, projectId: string, input: UpdateProjectMetadataInput): Promise<Project> {
  const parsed = parseUpdateProjectMetadataInput(input);

  return updateProjectMetadataRow({
    description: parsed.description !== undefined ? normalizeProjectDescription(parsed.description) : undefined,
    name: parsed.name,
    ownerId,
    projectId
  });
}

export async function renameProject(ownerId: string, projectId: string, nameInput: string): Promise<Project> {
  return updateProjectMetadata(ownerId, projectId, { name: nameInput });
}

export async function archiveProject(ownerId: string, projectId: string): Promise<void> {
  await archiveProjectRow(ownerId, projectId);
}

export async function deleteProject(ownerId: string, projectId: string): Promise<void> {
  await archiveProject(ownerId, projectId);
}

export async function listProjectVersions(ownerId: string, projectId: string): Promise<ProjectVersion[]> {
  return listProjectVersionRows(ownerId, projectId);
}
