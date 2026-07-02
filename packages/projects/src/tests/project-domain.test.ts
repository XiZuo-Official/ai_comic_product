import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeProjectDescription,
  parseCreateProjectInput,
  parseUpdateProjectMetadataInput,
  shouldCreateProjectVersion
} from "../domain/project";

test("parseCreateProjectInput accepts approved MVP metadata fields", () => {
  const input = parseCreateProjectInput({
    description: "  A compact sci-fi pilot.  ",
    name: "  Moonlit Courier  "
  });

  assert.equal(input.name, "Moonlit Courier");
  assert.equal(input.description, "A compact sci-fi pilot.");
});

test("parseCreateProjectInput rejects unknown fields", () => {
  assert.throws(
    () =>
      parseCreateProjectInput({
        name: "Moonlit Courier",
        tone: "dramatic"
      } as never),
    /Unrecognized key/
  );
});

test("parseUpdateProjectMetadataInput allows only name and description", () => {
  const input = parseUpdateProjectMetadataInput({
    description: null,
    name: "New Title"
  });

  assert.equal(input.name, "New Title");
  assert.equal(input.description, null);
  assert.throws(() => parseUpdateProjectMetadataInput({ genre: "fantasy" } as never), /Unrecognized key/);
});

test("parseUpdateProjectMetadataInput requires at least one metadata field", () => {
  assert.throws(() => parseUpdateProjectMetadataInput({}), /At least one project metadata field is required/);
});

test("normalizeProjectDescription stores blank descriptions as null", () => {
  assert.equal(normalizeProjectDescription("   "), null);
  assert.equal(normalizeProjectDescription(null), null);
  assert.equal(normalizeProjectDescription("  Story notes  "), "Story notes");
});

test("project versions are reserved for meaningful state changes", () => {
  assert.equal(shouldCreateProjectVersion("created"), true);
  assert.equal(shouldCreateProjectVersion("archived"), true);
  assert.equal(shouldCreateProjectVersion("metadata_updated"), false);
});
