"use server";

import { createProject, deleteProject, renameProject } from "@ai-comic/projects";
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
  const project = await createProject(userId, name);

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function renameProjectAction(formData: FormData) {
  const userId = await requireUserId();
  const projectId = String(formData.get("projectId") ?? "");
  const name = String(formData.get("name") ?? "");

  await renameProject(userId, projectId, name);
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteProjectAction(formData: FormData) {
  const userId = await requireUserId();
  const projectId = String(formData.get("projectId") ?? "");

  await deleteProject(userId, projectId);
  revalidatePath("/projects");
}
