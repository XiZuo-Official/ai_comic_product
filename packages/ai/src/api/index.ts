export type AiJobType = "text_generation" | "image_generation";

export type AiJobStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";

export type AiJobStepStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";

export type AiProviderCallStatus = "succeeded" | "failed";

export type AiPromptTemplateStatus = "active" | "archived";

export type AiJsonObject = Record<string, unknown>;

export type AiJob = {
  createdAt: Date;
  creditReservationId: string | null;
  error: string | null;
  estimatedCost: number;
  id: string;
  idempotencyKey: string | null;
  input: AiJsonObject;
  ownerId: string;
  progress: number;
  prompt: string;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  result: AiJsonObject | null;
  status: AiJobStatus;
  type: AiJobType;
  updatedAt: Date;
};

export type AiJobStep = {
  createdAt: Date;
  id: string;
  jobId: string;
  message: string | null;
  metadata: AiJsonObject;
  status: AiJobStepStatus;
  stepName: string;
  updatedAt: Date;
};

export type AiPromptTemplate = {
  createdAt: Date;
  id: string;
  metadata: AiJsonObject;
  purpose: string;
  status: AiPromptTemplateStatus;
  systemPrompt: string;
  templateKey: string;
  updatedAt: Date;
  version: number;
};

export type AiProviderCall = {
  completedAt: Date | null;
  error: string | null;
  id: string;
  jobId: string;
  operation: string;
  providerId: string;
  requestMetadata: AiJsonObject;
  responseMetadata: AiJsonObject | null;
  startedAt: Date;
  status: AiProviderCallStatus;
  stepId: string | null;
};

export type CreateAiJobInput = {
  idempotencyKey?: string | null;
  input?: AiJsonObject;
  prompt: string;
  promptTemplateKey?: string | null;
  promptTemplateVersion?: number | null;
  type: AiJobType;
};

export type AiJobEvent = {
  createdAt: Date;
  id: string;
  message: string | null;
  metadata: AiJsonObject;
  status: AiJobStepStatus;
  type: "step";
};

export type AiProviderGenerateInput = {
  input: AiJsonObject;
  jobId: string;
  prompt: string;
  promptTemplate: AiPromptTemplate;
  type: AiJobType;
};

export type AiProviderGenerateResult = {
  output: AiJsonObject;
  responseMetadata: AiJsonObject;
};

export type AiProviderAdapter = {
  generate(input: AiProviderGenerateInput): Promise<AiProviderGenerateResult>;
  providerId: string;
};

export type SingleImageAspectRatio = "1:1" | "2:3" | "3:2";

export type SingleImageStyle = "manga" | "comic" | "storybook";

export type GenerateSingleImageInput = {
  aspectRatio?: SingleImageAspectRatio | null;
  idempotencyKey?: string | null;
  projectId: string;
  prompt: string;
  style?: SingleImageStyle | null;
};

export type SingleImageResult = {
  assetId: string;
  assetPreviewUrl: string;
  downloadUrl: string;
  jobId: string;
  status: AiJobStatus;
};
