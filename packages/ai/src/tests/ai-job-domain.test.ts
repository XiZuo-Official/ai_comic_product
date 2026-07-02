import assert from "node:assert/strict";
import test from "node:test";

import {
  assertAiJobTransition,
  createAiJobSchema,
  defaultPromptTemplateForType,
  estimateAiJobCredits
} from "../domain/ai-job";
import { placeholderAiProvider } from "../infrastructure/provider-adapters/placeholder-provider";

test("create AI job input stays provider agnostic", () => {
  const parsed = createAiJobSchema.parse({
    input: { aspectRatio: "1:1" },
    prompt: "Generate a quiet forest scene",
    type: "image_generation"
  });

  assert.equal(parsed.type, "image_generation");
  assert.deepEqual(parsed.input, { aspectRatio: "1:1" });
});

test("create AI job input rejects provider-specific fields", () => {
  assert.throws(
    () =>
      createAiJobSchema.parse({
        model: "provider-specific-model",
        prompt: "Hello",
        type: "text_generation"
      }),
    /Unrecognized key/
  );
});

test("AI job lifecycle accepts documented transitions", () => {
  assert.doesNotThrow(() => assertAiJobTransition("queued", "running"));
  assert.doesNotThrow(() => assertAiJobTransition("running", "succeeded"));
  assert.doesNotThrow(() => assertAiJobTransition("running", "failed"));
  assert.doesNotThrow(() => assertAiJobTransition("queued", "canceled"));
});

test("AI job lifecycle rejects invalid transitions", () => {
  assert.throws(() => assertAiJobTransition("succeeded", "running"), /Cannot transition AI job/);
  assert.throws(() => assertAiJobTransition("failed", "succeeded"), /Cannot transition AI job/);
});

test("credit estimates are owned by the AI job foundation", () => {
  assert.equal(estimateAiJobCredits("text_generation"), 5);
  assert.equal(estimateAiJobCredits("image_generation"), 20);
});

test("release hardening keeps paid MVP AI credit estimates stable", () => {
  const paidMvpEstimates = {
    ideaChatMessage: estimateAiJobCredits("text_generation"),
    singleImageGeneration: estimateAiJobCredits("image_generation")
  };

  assert.deepEqual(paidMvpEstimates, {
    ideaChatMessage: 5,
    singleImageGeneration: 20
  });
});

test("default prompt templates are versioned by job type", () => {
  assert.deepEqual(defaultPromptTemplateForType("text_generation"), {
    templateKey: "mvp.text_generation",
    version: 1
  });
  assert.deepEqual(defaultPromptTemplateForType("image_generation"), {
    templateKey: "mvp.image_generation",
    version: 1
  });
});

test("placeholder provider returns provider-neutral output", async () => {
  const result = await placeholderAiProvider.generate({
    input: {},
    jobId: "job_123",
    prompt: "Draft a concept",
    promptTemplate: {
      createdAt: new Date(),
      id: "template_123",
      metadata: {},
      purpose: "text_generation",
      status: "active",
      systemPrompt: "system",
      templateKey: "mvp.text_generation",
      updatedAt: new Date(),
      version: 1
    },
    type: "text_generation"
  });

  assert.equal(result.output.outputType, "text_generation");
  assert.equal(result.output.resultRef, null);
  assert.equal(result.responseMetadata.templateKey, "mvp.text_generation");
});
