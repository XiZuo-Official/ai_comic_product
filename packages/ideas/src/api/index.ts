import type { AiJobStatus } from "@ai-comic/ai";

export type IdeaThreadStatus = "active" | "archived";

export type IdeaMessageRole = "user" | "assistant";

export type IdeaMessageStatus = "completed" | "failed";

export type IdeaJsonObject = Record<string, unknown>;

export type IdeaThread = {
  createdAt: Date;
  id: string;
  ownerId: string;
  projectId: string;
  status: IdeaThreadStatus;
  title: string;
  updatedAt: Date;
};

export type IdeaMessage = {
  aiJobId: string | null;
  content: string;
  createdAt: Date;
  error: string | null;
  id: string;
  metadata: IdeaJsonObject;
  role: IdeaMessageRole;
  status: IdeaMessageStatus;
  threadId: string;
  updatedAt: Date;
};

export type IdeaContextSnapshot = {
  aiJobId: string | null;
  context: IdeaJsonObject;
  createdAt: Date;
  id: string;
  projectId: string;
  threadId: string;
};

export type CreateIdeaThreadInput = {
  title?: string | null;
};

export type SendIdeaMessageInput = {
  content: string;
  idempotencyKey?: string | null;
};

export type IdeaThreadDetail = {
  messages: IdeaMessage[];
  thread: IdeaThread;
};

export type SendIdeaMessageResult = {
  aiJobId: string | null;
  aiJobStatus: AiJobStatus | null;
  assistantMessage: IdeaMessage;
  contextSnapshot: IdeaContextSnapshot;
  userMessage: IdeaMessage;
};
