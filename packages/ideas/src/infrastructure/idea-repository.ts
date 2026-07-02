import {
  db,
  ideaContextSnapshots,
  ideaMessages,
  ideaThreads,
  type IdeaContextSnapshotRow,
  type IdeaMessageRow,
  type IdeaThreadRow
} from "@ai-comic/db";
import { and, desc, eq } from "drizzle-orm";

import type {
  IdeaContextSnapshot,
  IdeaJsonObject,
  IdeaMessage,
  IdeaMessageRole,
  IdeaMessageStatus,
  IdeaThread,
  IdeaThreadStatus
} from "../api";

export function toIdeaThread(row: IdeaThreadRow): IdeaThread {
  return {
    id: row.id,
    createdAt: row.createdAt,
    ownerId: row.ownerId,
    projectId: row.projectId,
    status: row.status as IdeaThreadStatus,
    title: row.title,
    updatedAt: row.updatedAt
  };
}

export function toIdeaMessage(row: IdeaMessageRow): IdeaMessage {
  return {
    id: row.id,
    aiJobId: row.aiJobId,
    content: row.content,
    createdAt: row.createdAt,
    error: row.error,
    metadata: row.metadata,
    role: row.role as IdeaMessageRole,
    status: row.status as IdeaMessageStatus,
    threadId: row.threadId,
    updatedAt: row.updatedAt
  };
}

export function toIdeaContextSnapshot(row: IdeaContextSnapshotRow): IdeaContextSnapshot {
  return {
    id: row.id,
    aiJobId: row.aiJobId,
    context: row.context,
    createdAt: row.createdAt,
    projectId: row.projectId,
    threadId: row.threadId
  };
}

export async function createIdeaThreadRow(input: {
  ownerId: string;
  projectId: string;
  title: string;
}): Promise<IdeaThread> {
  const [thread] = await db
    .insert(ideaThreads)
    .values({
      ownerId: input.ownerId,
      projectId: input.projectId,
      title: input.title
    })
    .returning();

  return toIdeaThread(thread);
}

export async function listIdeaThreadRows(ownerId: string, projectId: string): Promise<IdeaThread[]> {
  const rows = await db
    .select()
    .from(ideaThreads)
    .where(and(eq(ideaThreads.ownerId, ownerId), eq(ideaThreads.projectId, projectId), eq(ideaThreads.status, "active")))
    .orderBy(desc(ideaThreads.updatedAt));

  return rows.map(toIdeaThread);
}

export async function findIdeaThreadRow(ownerId: string, threadId: string): Promise<IdeaThread | null> {
  const [thread] = await db
    .select()
    .from(ideaThreads)
    .where(and(eq(ideaThreads.ownerId, ownerId), eq(ideaThreads.id, threadId), eq(ideaThreads.status, "active")))
    .limit(1);

  return thread ? toIdeaThread(thread) : null;
}

export async function updateIdeaThreadTitleRow(input: {
  ownerId: string;
  threadId: string;
  title: string;
}): Promise<IdeaThread> {
  const [thread] = await db
    .update(ideaThreads)
    .set({
      title: input.title,
      updatedAt: new Date()
    })
    .where(and(eq(ideaThreads.ownerId, input.ownerId), eq(ideaThreads.id, input.threadId), eq(ideaThreads.status, "active")))
    .returning();

  if (!thread) {
    throw new Error("Idea thread not found");
  }

  return toIdeaThread(thread);
}

export async function touchIdeaThreadRow(ownerId: string, threadId: string): Promise<void> {
  await db
    .update(ideaThreads)
    .set({ updatedAt: new Date() })
    .where(and(eq(ideaThreads.ownerId, ownerId), eq(ideaThreads.id, threadId), eq(ideaThreads.status, "active")));
}

export async function listIdeaMessageRows(threadId: string): Promise<IdeaMessage[]> {
  const rows = await db.select().from(ideaMessages).where(eq(ideaMessages.threadId, threadId)).orderBy(ideaMessages.createdAt);

  return rows.map(toIdeaMessage);
}

export async function createIdeaMessageRow(input: {
  aiJobId?: string | null;
  content: string;
  error?: string | null;
  metadata?: IdeaJsonObject;
  role: IdeaMessageRole;
  status?: IdeaMessageStatus;
  threadId: string;
}): Promise<IdeaMessage> {
  const [message] = await db
    .insert(ideaMessages)
    .values({
      aiJobId: input.aiJobId,
      content: input.content,
      error: input.error,
      metadata: input.metadata ?? {},
      role: input.role,
      status: input.status ?? "completed",
      threadId: input.threadId
    })
    .returning();

  return toIdeaMessage(message);
}

export async function createIdeaContextSnapshotRow(input: {
  aiJobId?: string | null;
  context: IdeaJsonObject;
  projectId: string;
  threadId: string;
}): Promise<IdeaContextSnapshot> {
  const [snapshot] = await db
    .insert(ideaContextSnapshots)
    .values({
      aiJobId: input.aiJobId,
      context: input.context,
      projectId: input.projectId,
      threadId: input.threadId
    })
    .returning();

  return toIdeaContextSnapshot(snapshot);
}
