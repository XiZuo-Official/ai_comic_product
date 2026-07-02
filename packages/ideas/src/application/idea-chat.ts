import { createAiJob } from "@ai-comic/ai";
import { getProject } from "@ai-comic/projects";

import type {
  CreateIdeaThreadInput,
  IdeaContextSnapshot,
  IdeaJsonObject,
  IdeaMessage,
  IdeaThread,
  IdeaThreadDetail,
  SendIdeaMessageInput,
  SendIdeaMessageResult
} from "../api";
import {
  assertIdeaContextWithinLimit,
  defaultIdeaThreadTitle,
  ideaMessagesContext,
  normalizeIdeaThreadTitle,
  parseCreateIdeaThreadInput,
  parseSendIdeaMessageInput,
  titleFromMessage
} from "../domain/idea-chat";
import {
  createIdeaContextSnapshotRow,
  createIdeaMessageRow,
  createIdeaThreadRow,
  findIdeaThreadRow,
  listIdeaMessageRows,
  listIdeaThreadRows,
  touchIdeaThreadRow,
  updateIdeaThreadTitleRow
} from "../infrastructure/idea-repository";

async function requireProject(ownerId: string, projectId: string) {
  const project = await getProject(ownerId, projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}

function aiResultToMessage(jobResult: IdeaJsonObject | null): string {
  const summary = jobResult?.summary;

  return typeof summary === "string" && summary.trim().length > 0
    ? summary
    : "Placeholder idea response. Real provider integration starts in a later milestone.";
}

function buildIdeaContext(input: {
  messages: IdeaMessage[];
  project: Awaited<ReturnType<typeof requireProject>>;
  userMessage: string;
}): IdeaJsonObject {
  const context = {
    project: {
      description: input.project.description,
      id: input.project.id,
      name: input.project.name
    },
    recentMessages: ideaMessagesContext(input.messages),
    userMessage: input.userMessage,
    workflow: "idea_chat"
  };

  assertIdeaContextWithinLimit(context);

  return context;
}

function buildIdeaPrompt(context: IdeaJsonObject): string {
  return [
    "You are helping brainstorm an AI comic or manga project.",
    "Use the project context and recent conversation to suggest concise, useful creative direction.",
    JSON.stringify(context, null, 2)
  ].join("\n\n");
}

async function requireIdeaThread(ownerId: string, threadId: string): Promise<IdeaThread> {
  const thread = await findIdeaThreadRow(ownerId, threadId);

  if (!thread) {
    throw new Error("Idea thread not found");
  }

  return thread;
}

export async function listProjectIdeaThreads(ownerId: string, projectId: string): Promise<IdeaThread[]> {
  await requireProject(ownerId, projectId);

  return listIdeaThreadRows(ownerId, projectId);
}

export async function createIdeaThread(
  ownerId: string,
  projectId: string,
  input: CreateIdeaThreadInput = {}
): Promise<IdeaThread> {
  const parsed = parseCreateIdeaThreadInput(input);
  await requireProject(ownerId, projectId);

  return createIdeaThreadRow({
    ownerId,
    projectId,
    title: normalizeIdeaThreadTitle(parsed.title)
  });
}

export async function getIdeaThread(ownerId: string, threadId: string): Promise<IdeaThreadDetail> {
  const thread = await requireIdeaThread(ownerId, threadId);
  const messages = await listIdeaMessageRows(thread.id);

  return {
    messages,
    thread
  };
}

export async function sendIdeaMessage(ownerId: string, threadId: string, input: SendIdeaMessageInput): Promise<SendIdeaMessageResult> {
  const parsed = parseSendIdeaMessageInput(input);
  const thread = await requireIdeaThread(ownerId, threadId);
  const project = await requireProject(ownerId, thread.projectId);
  const existingMessages = await listIdeaMessageRows(thread.id);
  const context = buildIdeaContext({
    messages: existingMessages,
    project,
    userMessage: parsed.content
  });
  const userMessage = await createIdeaMessageRow({
    content: parsed.content,
    role: "user",
    threadId: thread.id
  });

  if (thread.title === defaultIdeaThreadTitle && existingMessages.length === 0) {
    await updateIdeaThreadTitleRow({
      ownerId,
      threadId: thread.id,
      title: titleFromMessage(parsed.content)
    });
  } else {
    await touchIdeaThreadRow(ownerId, thread.id);
  }

  let aiJobId: string | null = null;
  let aiJobStatus: SendIdeaMessageResult["aiJobStatus"] = null;
  let assistantMessage: IdeaMessage;
  let contextSnapshot: IdeaContextSnapshot;

  try {
    const job = await createAiJob(ownerId, {
      idempotencyKey: parsed.idempotencyKey,
      input: context,
      prompt: buildIdeaPrompt(context),
      promptTemplateKey: "mvp.idea_chat",
      promptTemplateVersion: 1,
      type: "text_generation"
    });

    aiJobId = job.id;
    aiJobStatus = job.status;
    contextSnapshot = await createIdeaContextSnapshotRow({
      aiJobId,
      context,
      projectId: thread.projectId,
      threadId: thread.id
    });

    if (job.status !== "succeeded") {
      assistantMessage = await createIdeaMessageRow({
        aiJobId,
        content: job.error ?? "Idea response generation failed.",
        error: job.error,
        role: "assistant",
        status: "failed",
        threadId: thread.id
      });
    } else {
      assistantMessage = await createIdeaMessageRow({
        aiJobId,
        content: aiResultToMessage(job.result),
        metadata: {
          aiJobStatus: job.status
        },
        role: "assistant",
        threadId: thread.id
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Idea response generation failed";

    contextSnapshot = await createIdeaContextSnapshotRow({
      context,
      projectId: thread.projectId,
      threadId: thread.id
    });
    assistantMessage = await createIdeaMessageRow({
      content: message,
      error: message,
      role: "assistant",
      status: "failed",
      threadId: thread.id
    });
  }

  await touchIdeaThreadRow(ownerId, thread.id);

  return {
    aiJobId,
    aiJobStatus,
    assistantMessage,
    contextSnapshot,
    userMessage
  };
}
