import assert from "node:assert/strict";
import test from "node:test";

import {
  createComicBubbleSchema,
  createComicPageSchema,
  createComicPanelSchema,
  normalizeComicPageTitle,
  shouldCreateComicLayoutVersion,
  updateComicPanelSchema
} from "../domain/comic-studio";

test("defaults blank page titles to the page number", () => {
  assert.equal(normalizeComicPageTitle({ pageNumber: 3, title: " " }), "Page 3");
});

test("accepts flexible page metadata", () => {
  const parsed = createComicPageSchema.parse({
    metadata: { tone: "quiet", notes: ["opening"] },
    projectId: "project_123",
    title: "Opening"
  });

  assert.deepEqual(parsed.metadata, { tone: "quiet", notes: ["opening"] });
});

test("rejects panel layouts outside canvas bounds", () => {
  assert.throws(
    () =>
      createComicPanelSchema.parse({
        height: 30,
        pageId: "page_123",
        width: 30,
        x: 80,
        y: 10
      }),
    /Layout width exceeds canvas bounds/
  );
});

test("rejects empty bubble text", () => {
  assert.throws(
    () =>
      createComicBubbleSchema.parse({
        height: 10,
        pageId: "page_123",
        text: "",
        width: 20,
        x: 10,
        y: 10
      }),
    /Bubble text is required/
  );
});

test("requires at least one panel update field", () => {
  assert.throws(() => updateComicPanelSchema.parse({}), /At least one panel field is required/);
});

test("rejects unknown page creation fields", () => {
  assert.throws(() => createComicPageSchema.parse({ projectId: "project_123", subtitle: "wrong" }), /Unrecognized key/);
});

test("layout versions are recorded for MVP layout changes", () => {
  assert.equal(shouldCreateComicLayoutVersion("page_created"), true);
  assert.equal(shouldCreateComicLayoutVersion("panel_updated"), true);
  assert.equal(shouldCreateComicLayoutVersion("bubble_updated"), true);
});
