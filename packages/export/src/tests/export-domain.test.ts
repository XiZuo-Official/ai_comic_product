import assert from "node:assert/strict";
import test from "node:test";

import { escapeHtml, exportFileName, normalizeExportSettings, parseCreateExportInput } from "../domain/export";

test("parseCreateExportInput accepts the MVP html export contract", () => {
  const parsed = parseCreateExportInput({
    format: "html",
    includeMetadata: true,
    projectId: "project-1"
  });

  assert.equal(parsed.projectId, "project-1");
  assert.equal(parsed.format, "html");
});

test("parseCreateExportInput rejects unknown future fields", () => {
  assert.throws(
    () =>
      parseCreateExportInput({
        projectId: "project-1",
        // @ts-expect-error Verifies runtime strictness for API payloads.
        publicPublishing: true
      }),
    /Unrecognized key/
  );
});

test("normalizeExportSettings defaults to the MVP html format", () => {
  assert.deepEqual(normalizeExportSettings({ projectId: "project-1" }), {
    format: "html",
    includeMetadata: true
  });
});

test("exportFileName creates a stable html file name", () => {
  assert.equal(
    exportFileName({
      createdAt: new Date("2026-07-02T12:00:00.000Z"),
      projectName: "My Comic: Pilot!"
    }),
    "my-comic-pilot-2026-07-02.html"
  );
});

test("escapeHtml escapes unsafe markup", () => {
  assert.equal(escapeHtml("<script>alert('x')</script>"), "&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;");
});
