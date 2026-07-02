import assert from "node:assert/strict";
import test from "node:test";

import { createUploadTarget, resolveStorageUrl } from "../index";

test("creates local upload targets without requiring persisted public URLs", () => {
  const target = createUploadTarget({
    contentLength: 12,
    contentType: "image/png",
    fileName: "Hero Pose.png",
    ownerId: "user_123",
    projectId: "project_123"
  });

  assert.equal(target.storageProvider, "local");
  assert.match(target.storageKey, /^assets\/user_123\/project_123\/.+-hero-pose.png$/);
  assert.equal(target.uploadUrl, resolveStorageUrl({ storageProvider: target.storageProvider, storageKey: target.storageKey }));
});

test("rejects empty storage keys during URL resolution", () => {
  assert.throws(() => resolveStorageUrl({ storageProvider: "local", storageKey: "" }), /Storage key is required/);
});
