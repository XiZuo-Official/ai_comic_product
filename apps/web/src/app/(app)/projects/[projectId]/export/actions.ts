"use server";

import { createProjectExport } from "@ai-comic/export";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

async function requireUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  return userId;
}

function exportPath(projectId: string): string {
  return `/projects/${projectId}/export`;
}

export async function createExportAction(formData: FormData) {
  const userId = await requireUserId();
  const projectId = String(formData.get("projectId") ?? "");

  await createProjectExport(userId, {
    format: "html",
    includeMetadata: formData.get("includeMetadata") === "on",
    projectId
  });

  revalidatePath(exportPath(projectId));
}
