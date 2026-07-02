import {
  commitCreditReservation,
  releaseCreditReservation,
  reserveCredits
} from "@ai-comic/credits";

import type { AiJob, AiJobEvent, AiProviderAdapter, CreateAiJobInput } from "../api";
import {
  assertAiJobTransition,
  defaultPromptTemplateForType,
  errorMessage,
  estimateAiJobCredits,
  normalizeAiIdempotencyKey,
  normalizeAiJobInput,
  parseCreateAiJobInput
} from "../domain/ai-job";
import {
  createAiJobRow,
  createAiJobStepRow,
  createProviderCallRow,
  ensurePromptTemplateRow,
  findAiJobById,
  findAiJobByIdempotencyKey,
  listAiJobStepRows,
  updateAiJobStatusRow
} from "../infrastructure/ai-job-repository";
import { placeholderAiProvider } from "../infrastructure/provider-adapters/placeholder-provider";

type CreateAiJobOptions = {
  provider?: AiProviderAdapter;
};

function jobStepToEvent(step: Awaited<ReturnType<typeof createAiJobStepRow>>): AiJobEvent {
  return {
    id: step.id,
    createdAt: step.createdAt,
    message: step.message,
    metadata: step.metadata,
    status: step.status,
    type: "step"
  };
}

export async function createAiJob(ownerId: string, input: CreateAiJobInput, options: CreateAiJobOptions = {}): Promise<AiJob> {
  const parsed = parseCreateAiJobInput(input);
  const idempotencyKey = normalizeAiIdempotencyKey(parsed.idempotencyKey);

  if (idempotencyKey) {
    const existingJob = await findAiJobByIdempotencyKey(ownerId, idempotencyKey);

    if (existingJob) {
      return existingJob;
    }
  }

  const defaultTemplate = defaultPromptTemplateForType(parsed.type);
  const promptTemplateKey = parsed.promptTemplateKey ?? defaultTemplate.templateKey;
  const promptTemplateVersion = parsed.promptTemplateVersion ?? defaultTemplate.version;
  const estimatedCost = estimateAiJobCredits(parsed.type);
  const reservation = await reserveCredits(ownerId, {
    amount: estimatedCost,
    idempotencyKey: idempotencyKey ? `ai-job:${idempotencyKey}` : null,
    reason: `AI job ${parsed.type}`
  });
  const promptTemplate = await ensurePromptTemplateRow({
    purpose: parsed.type,
    systemPrompt: "MVP placeholder prompt template. Real prompt content is introduced by feature workflows.",
    templateKey: promptTemplateKey,
    version: promptTemplateVersion
  });
  const normalizedInput = normalizeAiJobInput(parsed.input);
  const job = await createAiJobRow({
    creditReservationId: reservation.id,
    estimatedCost,
    idempotencyKey,
    input: normalizedInput,
    ownerId,
    prompt: parsed.prompt,
    promptTemplateKey,
    promptTemplateVersion,
    type: parsed.type
  });

  await createAiJobStepRow({
    jobId: job.id,
    message: "AI job queued after credit reservation.",
    metadata: { estimatedCost },
    status: "queued",
    stepName: "queued"
  });

  return runReservedAiJob(ownerId, job, promptTemplate, options.provider ?? placeholderAiProvider);
}

export async function getAiJob(ownerId: string, jobId: string): Promise<AiJob | null> {
  return findAiJobById(ownerId, jobId);
}

export async function listAiJobEvents(ownerId: string, jobId: string): Promise<AiJobEvent[]> {
  const steps = await listAiJobStepRows(ownerId, jobId);

  return steps.map(jobStepToEvent);
}

async function runReservedAiJob(
  ownerId: string,
  job: AiJob,
  promptTemplate: Awaited<ReturnType<typeof ensurePromptTemplateRow>>,
  provider: AiProviderAdapter
): Promise<AiJob> {
  assertAiJobTransition(job.status, "running");
  let runningJob = await updateAiJobStatusRow({
    jobId: job.id,
    ownerId,
    progress: 25,
    status: "running"
  });
  const runningStep = await createAiJobStepRow({
    jobId: job.id,
    message: "AI job is running through the provider adapter boundary.",
    metadata: {},
    status: "running",
    stepName: "provider_execution"
  });

  try {
    const providerResult = await provider.generate({
      input: runningJob.input,
      jobId: runningJob.id,
      prompt: runningJob.prompt,
      promptTemplate,
      type: runningJob.type
    });

    await createProviderCallRow({
      jobId: runningJob.id,
      operation: runningJob.type,
      providerId: provider.providerId,
      requestMetadata: {
        promptLength: runningJob.prompt.length,
        templateKey: promptTemplate.templateKey,
        templateVersion: promptTemplate.version
      },
      responseMetadata: providerResult.responseMetadata,
      status: "succeeded",
      stepId: runningStep.id
    });
    await commitCreditReservation(ownerId, runningJob.creditReservationId ?? "", {
      idempotencyKey: `ai-job-commit:${runningJob.id}`,
      reason: `AI job ${runningJob.type} succeeded`
    });
    assertAiJobTransition(runningJob.status, "succeeded");
    runningJob = await updateAiJobStatusRow({
      jobId: runningJob.id,
      ownerId,
      progress: 100,
      result: providerResult.output,
      status: "succeeded"
    });
    await createAiJobStepRow({
      jobId: runningJob.id,
      message: "AI job succeeded and credits were committed.",
      metadata: {},
      status: "succeeded",
      stepName: "completed"
    });

    return runningJob;
  } catch (error) {
    const message = errorMessage(error);

    await createProviderCallRow({
      error: message,
      jobId: runningJob.id,
      operation: runningJob.type,
      providerId: provider.providerId,
      requestMetadata: {
        promptLength: runningJob.prompt.length,
        templateKey: promptTemplate.templateKey,
        templateVersion: promptTemplate.version
      },
      status: "failed",
      stepId: runningStep.id
    });

    if (runningJob.creditReservationId) {
      await releaseCreditReservation(ownerId, runningJob.creditReservationId, {
        idempotencyKey: `ai-job-release:${runningJob.id}`,
        reason: `AI job ${runningJob.type} failed`
      });
    }

    assertAiJobTransition(runningJob.status, "failed");
    const failedJob = await updateAiJobStatusRow({
      error: message,
      jobId: runningJob.id,
      ownerId,
      progress: runningJob.progress,
      status: "failed"
    });
    await createAiJobStepRow({
      jobId: failedJob.id,
      message,
      metadata: {},
      status: "failed",
      stepName: "failed"
    });

    return failedJob;
  }
}
