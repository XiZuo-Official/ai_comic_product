"use server";

import { generateSingleImage } from "@ai-comic/ai";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function requireUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  return userId;
}

export async function generateSingleImageAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  let target = `/single-image-mode?projectId=${encodeURIComponent(projectId)}`;

  try {
    const userId = await requireUserId();
    const result = await generateSingleImage(userId, {
      aspectRatio: String(formData.get("aspectRatio") ?? "1:1") as "1:1" | "2:3" | "3:2",
      projectId,
      prompt: String(formData.get("prompt") ?? ""),
      style: String(formData.get("style") ?? "manga") as "manga" | "comic" | "storybook"
    });

    target = `/single-image-mode?projectId=${encodeURIComponent(projectId)}&jobId=${encodeURIComponent(result.jobId)}&assetId=${encodeURIComponent(result.assetId)}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Single image generation failed";
    target = `/single-image-mode?projectId=${encodeURIComponent(projectId)}&error=${encodeURIComponent(message)}`;
  }

  redirect(target);
}
