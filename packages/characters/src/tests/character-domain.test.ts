import assert from "node:assert/strict";
import test from "node:test";

import {
  createCharacterSchema,
  normalizeCharacterKey,
  normalizeCharacterName,
  normalizeReferenceAssetIds,
  updateCharacterSchema
} from "../domain/character";

test("normalizes character names for display and duplicate checks", () => {
  assert.equal(normalizeCharacterName("  Mira   Moon  "), "Mira Moon");
  assert.equal(normalizeCharacterKey("  Mira   Moon  "), "mira moon");
});

test("accepts flexible character metadata", () => {
  const parsed = createCharacterSchema.parse({
    metadata: { role: "protagonist", traits: ["curious", "brave"] },
    name: "Mira",
    projectId: "project_123"
  });

  assert.deepEqual(parsed.metadata, { role: "protagonist", traits: ["curious", "brave"] });
});

test("rejects missing character names", () => {
  assert.throws(
    () =>
      createCharacterSchema.parse({
        name: "",
        projectId: "project_123"
      }),
    /Character name is required/
  );
});

test("deduplicates reference asset ids", () => {
  assert.deepEqual(normalizeReferenceAssetIds(["asset_1", " asset_1 ", "asset_2"]), ["asset_1", "asset_2"]);
});

test("requires at least one character update field", () => {
  assert.throws(() => updateCharacterSchema.parse({}), /At least one character field is required/);
});

test("rejects unknown update fields", () => {
  assert.throws(() => updateCharacterSchema.parse({ title: "wrong" }), /Unrecognized key/);
});
