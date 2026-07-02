import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("database migrations are ordered and non-destructive for the release candidate", () => {
  const migrations = readdirSync(path.join(root, "infra/migrations"))
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  assert.deepEqual(
    migrations,
    [
      "0001_milestone_1a_projects.sql",
      "0002_milestone_2_user_profiles.sql",
      "0003_milestone_3_credits.sql",
      "0004_milestone_4_subscription.sql",
      "0005_milestone_5_projects.sql",
      "0006_milestone_6_assets.sql",
      "0007_milestone_7_ai_jobs.sql",
      "0008_milestone_9_idea_chat.sql",
      "0009_milestone_10_characters.sql",
      "0010_milestone_11_comic_studio.sql",
      "0011_milestone_12_export.sql"
    ]
  );

  const destructivePattern = /\b(drop|truncate)\b/i;
  migrations.forEach((migration) => {
    assert.equal(destructivePattern.test(read(`infra/migrations/${migration}`)), false, `${migration} must remain additive`);
  });
});

test("release candidate docs include required hardening reviews", () => {
  const releaseCandidate = read("docs/RELEASE_CANDIDATE.md");

  [
    "Database Rollback Review",
    "Logging Review",
    "Rate Limiting Review",
    "Operational Review",
    "Release Gate"
  ].forEach((heading) => assert.match(releaseCandidate, new RegExp(heading)));
});

test("release gate preserves the approved Version 1.0 acceptance requirements", () => {
  const releaseCandidate = read("docs/RELEASE_CANDIDATE.md");

  [
    "All acceptance criteria pass",
    "Smoke tests pass",
    "Build succeeds",
    "Database migrations succeed",
    "Documentation matches implementation",
    "No architecture violations remain"
  ].forEach((requirement) => assert.match(releaseCandidate, new RegExp(requirement)));
});
