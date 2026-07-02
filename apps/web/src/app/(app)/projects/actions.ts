"use server";

import { archiveProject, createProject, updateProjectMetadata } from "@ai-comic/projects";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  return userId;
}

export async function createProjectAction(formData: FormData) {
  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const project = await createProject(userId, { description, name });

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function renameProjectAction(formData: FormData) {
  const userId = await requireUserId();
  const projectId = String(formData.get("projectId") ?? "");
  const name = String(formData.get("name") ?? "");

  await updateProjectMetadata(userId, projectId, { name });
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

export async function updateProjectMetadataAction(formData: FormData) {
  const userId = await requireUserId();
  const projectId = String(formData.get("projectId") ?? "");
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");

  await updateProjectMetadata(userId, projectId, { description, name });
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

export async function archiveProjectAction(formData: FormData) {
  const userId = await requireUserId();
  const projectId = String(formData.get("projectId") ?? "");

  await archiveProject(userId, projectId);
  revalidatePath("/projects");
}

export const deleteProjectAction = archiveProjectAction;
