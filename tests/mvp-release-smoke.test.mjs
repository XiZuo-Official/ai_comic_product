import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function file(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return readFileSync(file(relativePath), "utf8");
}

function assertExists(relativePath) {
  assert.equal(existsSync(file(relativePath)), true, `${relativePath} should exist`);
}

test("MVP authenticated page surfaces exist for Version 1.0", () => {
  [
    "apps/web/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx",
    "apps/web/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx",
    "apps/web/src/app/(auth)/sign-out/page.tsx",
    "apps/web/src/app/(app)/profile/page.tsx",
    "apps/web/src/app/(app)/page.tsx",
    "apps/web/src/app/(app)/projects/page.tsx",
    "apps/web/src/app/(app)/single-image-mode/page.tsx",
    "apps/web/src/app/(app)/credits/page.tsx",
    "apps/web/src/app/(app)/subscription/page.tsx"
  ].forEach(assertExists);
});

test("MVP project module pages exist for the release candidate", () => {
  [
    "apps/web/src/app/(app)/projects/[projectId]/page.tsx",
    "apps/web/src/app/(app)/projects/[projectId]/idea-chat/page.tsx",
    "apps/web/src/app/(app)/projects/[projectId]/characters/page.tsx",
    "apps/web/src/app/(app)/projects/[projectId]/asset-library/page.tsx",
    "apps/web/src/app/(app)/projects/[projectId]/comic-studio/page.tsx",
    "apps/web/src/app/(app)/projects/[projectId]/export/page.tsx"
  ].forEach(assertExists);
});

test("MVP API route surfaces cover core smoke flows", () => {
  [
    "apps/web/src/app/v1/me/route.ts",
    "apps/web/src/app/v1/projects/route.ts",
    "apps/web/src/app/v1/projects/[projectId]/route.ts",
    "apps/web/src/app/v1/assets/route.ts",
    "apps/web/src/app/v1/assets/upload-url/route.ts",
    "apps/web/src/app/v1/single-image/jobs/route.ts",
    "apps/web/src/app/v1/ai/jobs/route.ts",
    "apps/web/src/app/v1/credits/balance/route.ts",
    "apps/web/src/app/v1/credits/ledger/route.ts",
    "apps/web/src/app/v1/subscription/route.ts",
    "apps/web/src/app/v1/projects/[projectId]/idea-threads/route.ts",
    "apps/web/src/app/v1/characters/[characterId]/route.ts",
    "apps/web/src/app/v1/comic-pages/[pageId]/route.ts",
    "apps/web/src/app/v1/exports/route.ts",
    "apps/web/src/app/v1/exports/[exportId]/download/route.ts"
  ].forEach(assertExists);
});

test("release candidate keeps future roadmap features out of the route tree", () => {
  const forbiddenRouteSegments = ["marketplace", "admin", "analytics", "enterprise", "collaboration", "reading-platform", "teams"];
  const routeManifest = read("docs/MVP_FREEZE.md") + "\n" + read("docs/PRD.md");

  forbiddenRouteSegments.forEach((segment) => {
    assert.equal(existsSync(file(`apps/web/src/app/(app)/${segment}`)), false, `${segment} route must remain out of MVP`);
  });
  assert.match(routeManifest, /Marketplace/);
  assert.match(routeManifest, /not included in Version 1\.0|Non-Goals/);
});

test("release candidate documentation covers every implemented milestone", () => {
  for (const milestone of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    assertExists(`docs/MILESTONE_${milestone}_COMPLETION_REPORT.md`);
  }

  const milestones = read("docs/MILESTONES.md");
  assert.match(milestones, /Milestone 13: Version 1\.0 Release Hardening/);
});
