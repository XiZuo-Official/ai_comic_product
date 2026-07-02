import { Buffer } from "node:buffer";

import { uploadAssetFile } from "@ai-comic/assets";

import type { GenerateSingleImageInput, SingleImageResult } from "../api";
import { parseGenerateSingleImageInput, singleImageFileName, singleImageSettingsLabel } from "../domain/single-image";
import { createAiJob } from "./ai-jobs";

const placeholderPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAACXBIWXMAAAsTAAALEwEAmpwYAAAATUlEQVR4nO3PQQ0AIBDAMMC/5+ONAvZoFSzZnXtn9wC8G+gCugBugBugBugCugBugBugBugCugBugBugBugCugBugBugBugCugBugBugBugCugBugD5lzApc5V5YAAAAAElFTkSuQmCC";

function placeholderPngContent(): Uint8Array {
  return new Uint8Array(Buffer.from(placeholderPngBase64, "base64"));
}

export async function generateSingleImage(ownerId: string, input: GenerateSingleImageInput): Promise<SingleImageResult> {
  const parsed = parseGenerateSingleImageInput(input);
  const label = singleImageSettingsLabel({
    aspectRatio: parsed.aspectRatio,
    style: parsed.style
  });
  const job = await createAiJob(ownerId, {
    idempotencyKey: parsed.idempotencyKey,
    input: {
      aspectRatio: parsed.aspectRatio,
      style: parsed.style,
      workflow: "single_image"
    },
    prompt: parsed.prompt,
    promptTemplateKey: "mvp.single_image",
    promptTemplateVersion: 1,
    type: "image_generation"
  });

  if (job.status !== "succeeded") {
    throw new Error(job.error ?? "Single image generation failed");
  }

  const content = placeholderPngContent();
  const asset = await uploadAssetFile(ownerId, {
    content,
    description: `Generated from prompt: ${parsed.prompt}`,
    displayName: `Generated ${label}`,
    fileName: singleImageFileName(),
    fileSize: content.byteLength,
    metadata: {
      aiJobId: job.id,
      aspectRatio: parsed.aspectRatio,
      prompt: parsed.prompt,
      source: "single_image_mode",
      style: parsed.style
    },
    mimeType: "image/png",
    projectId: parsed.projectId,
    tags: ["generated", "single image", parsed.style]
  });

  return {
    assetId: asset.id,
    assetPreviewUrl: asset.previewUrl,
    downloadUrl: asset.previewUrl,
    jobId: job.id,
    status: job.status
  };
}
