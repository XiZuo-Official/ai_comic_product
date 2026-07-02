import assert from "node:assert/strict";
import test from "node:test";

import {
  generateSingleImageSchema,
  parseGenerateSingleImageInput,
  singleImageSettingsLabel
} from "../domain/single-image";

test("single image input applies MVP defaults", () => {
  const parsed = parseGenerateSingleImageInput({
    projectId: "project_123",
    prompt: "A moonlit manga rooftop"
  });

  assert.equal(parsed.aspectRatio, "1:1");
  assert.equal(parsed.style, "manga");
});

test("single image input rejects empty prompts", () => {
  assert.throws(
    () =>
      generateSingleImageSchema.parse({
        projectId: "project_123",
        prompt: ""
      }),
    /Prompt is required/
  );
});

test("single image input rejects unknown settings", () => {
  assert.throws(
    () =>
      generateSingleImageSchema.parse({
        model: "provider-specific",
        projectId: "project_123",
        prompt: "Hello"
      }),
    /Unrecognized key/
  );
});

test("single image settings label is stable", () => {
  assert.equal(singleImageSettingsLabel({ aspectRatio: "2:3", style: "comic" }), "comic 2:3");
});
