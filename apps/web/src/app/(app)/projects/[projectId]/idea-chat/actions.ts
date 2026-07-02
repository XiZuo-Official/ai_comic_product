"use server";

import { createIdeaThread, sendIdeaMessage } from "@ai-comic/ideas";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function requireUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  return userId;
}

export async function createIdeaThreadAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  let target = `/projects/${encodeURIComponent(projectId)}/idea-chat`;

  try {
    const userId = await requireUserId();
    const thread = await createIdeaThread(userId, projectId, {
      title: String(formData.get("title") ?? "")
    });

    target = `/projects/${encodeURIComponent(projectId)}/idea-chat?threadId=${encodeURIComponent(thread.id)}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Idea thread creation failed";
    target = `/projects/${encodeURIComponent(projectId)}/idea-chat?error=${encodeURIComponent(message)}`;
  }

  redirect(target);
}

export async function sendIdeaMessageAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const threadId = String(formData.get("threadId") ?? "");
  let target = `/projects/${encodeURIComponent(projectId)}/idea-chat?threadId=${encodeURIComponent(threadId)}`;

  try {
    const userId = await requireUserId();
    await sendIdeaMessage(userId, threadId, {
      content: String(formData.get("content") ?? "")
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Idea message failed";
    target = `/projects/${encodeURIComponent(projectId)}/idea-chat?threadId=${encodeURIComponent(threadId)}&error=${encodeURIComponent(message)}`;
  }

  redirect(target);
}
