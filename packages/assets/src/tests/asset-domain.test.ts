import assert from "node:assert/strict";
import test from "node:test";

import {
  createAssetSchema,
  createAssetUploadUrlSchema,
  normalizeTagNames,
  updateAssetSchema
} from "../domain/asset";

test("accepts flexible metadata for non-image asset properties", () => {
  const parsed = createAssetSchema.parse({
    fileName: "notes.pdf",
    fileSize: 1024,
    metadata: { pageCount: 12, source: "upload" },
    mimeType: "application/pdf",
    projectId: "project_123",
    storageKey: "assets/user/project/file.pdf",
    storageProvider: "local"
  });

  assert.deepEqual(parsed.metadata, { pageCount: 12, source: "upload" });
});

test("rejects unsupported file types", () => {
  assert.throws(
    () =>
      createAssetUploadUrlSchema.parse({
        fileName: "archive.zip",
        fileSize: 1024,
        mimeType: "application/zip",
        projectId: "project_123"
      }),
    /Unsupported file type/
  );
});

test("rejects oversized files", () => {
  assert.throws(
    () =>
      createAssetUploadUrlSchema.parse({
        fileName: "huge.png",
        fileSize: 26 * 1024 * 1024,
        mimeType: "image/png",
        projectId: "project_123"
      }),
    /File is too large/
  );
});

test("normalizes and deduplicates tag names", () => {
  assert.deepEqual(normalizeTagNames([" Hero ", "hero", "Main   Character"]), ["Hero", "Main Character"]);
});

test("requires at least one asset update field", () => {
  assert.throws(() => updateAssetSchema.parse({}), /At least one asset field is required/);
});

test("rejects unknown update fields", () => {
  assert.throws(() => updateAssetSchema.parse({ title: "wrong" }), /Unrecognized key/);
});
