# Task Breakdown

## Purpose

This document breaks every Version 1.0 milestone into small implementation tasks.
Each task should take approximately 1-3 hours and should be small enough to become a single pull request.

## Rules

- Tasks must stay inside `MVP_FREEZE.md`.
- Each task should be independently reviewable.
- Each task should include focused tests or validation.
- Do not combine unrelated modules in one task.
- If a task reveals missing scope, stop and request approval before expanding Version 1.0.

---

## Milestone 1: Project Foundation

### M1-T01: Configure Monorepo Scripts
- Description: Add root-level package scripts for checking, linting placeholder flow, and local development entry points.
- Dependencies: Existing scaffold.
- Expected Files: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.json`.
- Acceptance Criteria: Root scripts exist, run without application logic, and do not require out-of-scope dependencies.

### M1-T02: Create Web App Shell
- Description: Create the minimal web application shell with routing, base layout, and empty authenticated-product surface.
- Dependencies: M1-T01.
- Expected Files: `apps/web/package.json`, `apps/web/src/*`, `apps/web/tsconfig.json`.
- Acceptance Criteria: Web app starts locally and renders a stable shell page.

### M1-T03: Create API App Shell
- Description: Create the minimal API application shell with versioned route structure.
- Dependencies: M1-T01.
- Expected Files: `apps/api/package.json`, `apps/api/src/*`, `apps/api/tsconfig.json`.
- Acceptance Criteria: API app starts locally and exposes a versioned API root.

### M1-T04: Add Environment Configuration
- Description: Define environment variable structure and validation placeholders for web and API apps.
- Dependencies: M1-T02, M1-T03.
- Expected Files: `.env.example`, `packages/config/*`, `apps/web/src/*`, `apps/api/src/*`.
- Acceptance Criteria: Missing required environment variables produce clear local errors.

### M1-T05: Add Health Check
- Description: Add an API health check endpoint and basic web status surface.
- Dependencies: M1-T03.
- Expected Files: `apps/api/src/*`, `apps/web/src/*`.
- Acceptance Criteria: Health endpoint returns success and can be used by deployment checks.

---

## Milestone 2: Authentication and User Profile

### M2-T01: Define Auth Domain Contracts
- Description: Define public authentication and session contracts without leaking implementation details.
- Dependencies: M1-T01.
- Expected Files: `packages/auth/api/*`, `packages/types/*`, `docs/API.md`.
- Acceptance Criteria: Auth request, response, and session types are documented and exported through public interfaces.

### M2-T02: Add Auth Persistence
- Description: Add persistence definitions for `users`, `sessions`, and `auth_identities`.
- Dependencies: M2-T01.
- Expected Files: `packages/auth/infrastructure/*`, `packages/db/*`, `infra/migrations/*`.
- Acceptance Criteria: Auth persistence can create users, sessions, and identities without cross-module table access.

### M2-T03: Implement Auth APIs
- Description: Implement login, logout, session lookup, and current-user API handlers.
- Dependencies: M2-T02.
- Expected Files: `apps/api/src/*`, `packages/auth/application/*`.
- Acceptance Criteria: Auth APIs return expected statuses for valid, invalid, and expired session cases.

### M2-T04: Add Protected Route Flow
- Description: Add web session detection and protected route behavior.
- Dependencies: M2-T03.
- Expected Files: `apps/web/src/*`, `packages/auth/api/*`.
- Acceptance Criteria: Signed-out users are redirected from protected pages and signed-in users can access them.

### M2-T05: Implement User Profile
- Description: Add profile persistence, API, and basic profile page.
- Dependencies: M2-T03.
- Expected Files: `packages/auth/*`, `apps/api/src/*`, `apps/web/src/*`, `infra/migrations/*`.
- Acceptance Criteria: User can view and update allowed profile fields with validation.

---

## Milestone 3: Credits Ledger

### M3-T01: Define Credits Domain Contracts
- Description: Define credit account, balance, ledger, reservation, commit, release, and refund contracts.
- Dependencies: M2-T01.
- Expected Files: `packages/credits/api/*`, `packages/types/*`, `docs/API.md`.
- Acceptance Criteria: Credits module exposes public interfaces for all MVP credit operations.

### M3-T02: Add Credits Persistence
- Description: Add persistence for `credit_accounts`, `credit_ledger_entries`, `credit_reservations`, and `credit_refunds`.
- Dependencies: M3-T01.
- Expected Files: `packages/credits/infrastructure/*`, `packages/db/*`, `infra/migrations/*`.
- Acceptance Criteria: Ledger entries are append-only and balances can be derived or cached safely.

### M3-T03: Implement Reservation Lifecycle
- Description: Implement reserve, commit, release, and refund use cases.
- Dependencies: M3-T02.
- Expected Files: `packages/credits/application/*`, `packages/credits/domain/*`.
- Acceptance Criteria: Balance never becomes negative and duplicate operations are idempotent.

### M3-T04: Implement Credits APIs
- Description: Add balance, ledger, reservation, commit, and release API handlers.
- Dependencies: M3-T03.
- Expected Files: `apps/api/src/*`, `packages/credits/api/*`.
- Acceptance Criteria: API responses match documented contracts and reject insufficient-credit requests.

### M3-T05: Add Credits UI
- Description: Add credit balance and ledger views.
- Dependencies: M3-T04.
- Expected Files: `apps/web/src/*`, `packages/ui/*`.
- Acceptance Criteria: User can view balance and ledger history from the web app.

---

## Milestone 4: Subscription

### M4-T01: Define Subscription Contracts
- Description: Define plan, subscription, entitlement, checkout, and webhook contracts.
- Dependencies: M3-T01.
- Expected Files: `packages/billing/api/*`, `packages/types/*`, `docs/API.md`.
- Acceptance Criteria: Subscription contracts describe all MVP states without provider-specific leakage.

### M4-T02: Add Subscription Persistence
- Description: Add persistence for `plans`, `subscriptions`, and `subscription_events`.
- Dependencies: M4-T01.
- Expected Files: `packages/billing/infrastructure/*`, `packages/db/*`, `infra/migrations/*`.
- Acceptance Criteria: Subscription events can be stored idempotently.

### M4-T03: Implement Plan and Subscription APIs
- Description: Add APIs for current subscription, plan list, and checkout entry point.
- Dependencies: M4-T02.
- Expected Files: `apps/api/src/*`, `packages/billing/application/*`.
- Acceptance Criteria: User can retrieve plans and current subscription status.

### M4-T04: Implement Webhook Credit Grant Flow
- Description: Process subscription events and grant credits through the Credits public interface.
- Dependencies: M3-T03, M4-T02.
- Expected Files: `packages/billing/application/*`, `apps/api/src/*`.
- Acceptance Criteria: Duplicate webhook events do not duplicate credit grants.

### M4-T05: Add Subscription UI
- Description: Add subscription page with plan, status, and checkout action.
- Dependencies: M4-T03.
- Expected Files: `apps/web/src/*`, `packages/ui/*`.
- Acceptance Criteria: User can view plan status and start checkout.

---

## Milestone 5: Projects

### M5-T01: Define Project Contracts
- Description: Define project, project settings, and project version public contracts.
- Dependencies: M2-T01.
- Expected Files: `packages/projects/api/*`, `packages/types/*`, `docs/API.md`.
- Acceptance Criteria: Project contracts support create, list, read, update, archive, and version tracking.

### M5-T02: Add Project Persistence
- Description: Add persistence for `projects`, `project_settings`, and `project_versions`.
- Dependencies: M5-T01.
- Expected Files: `packages/projects/infrastructure/*`, `packages/db/*`, `infra/migrations/*`.
- Acceptance Criteria: Projects are scoped to the authenticated user or workspace boundary.

### M5-T03: Implement Project APIs
- Description: Add project list, create, read, and update API handlers.
- Dependencies: M5-T02.
- Expected Files: `apps/api/src/*`, `packages/projects/application/*`.
- Acceptance Criteria: Users can manage only their own projects.

### M5-T04: Add Project List UI
- Description: Add dashboard/project list with create project flow.
- Dependencies: M5-T03.
- Expected Files: `apps/web/src/*`, `packages/ui/*`.
- Acceptance Criteria: User can create and view projects from the dashboard.

### M5-T05: Add Project Detail UI
- Description: Add project detail page with editable metadata.
- Dependencies: M5-T03.
- Expected Files: `apps/web/src/*`, `packages/ui/*`.
- Acceptance Criteria: User can open a project and update project metadata.

---

## Milestone 6: Asset Library

### M6-T01: Define Asset Contracts
- Description: Define asset, variant, tag, upload URL, and asset metadata contracts.
- Dependencies: M5-T01.
- Expected Files: `packages/assets/api/*`, `packages/storage/api/*`, `packages/types/*`, `docs/API.md`.
- Acceptance Criteria: Asset contracts cover upload, create, list, read, update, and delete.

### M6-T02: Add Asset Persistence
- Description: Add persistence for `assets`, `asset_variants`, and `asset_tags`.
- Dependencies: M6-T01.
- Expected Files: `packages/assets/infrastructure/*`, `packages/db/*`, `infra/migrations/*`.
- Acceptance Criteria: Assets remain scoped to projects and retain metadata.

### M6-T03: Implement Storage Adapter
- Description: Add storage abstraction for upload URLs and file references.
- Dependencies: M6-T01.
- Expected Files: `packages/storage/*`, `packages/assets/application/*`.
- Acceptance Criteria: Asset module depends only on the storage public interface.

### M6-T04: Implement Asset APIs
- Description: Add upload URL, create, list, read, update, and delete API handlers.
- Dependencies: M6-T02, M6-T03.
- Expected Files: `apps/api/src/*`, `packages/assets/application/*`.
- Acceptance Criteria: Unsupported file types, missing files, and unauthorized access are rejected.

### M6-T05: Add Asset Library UI
- Description: Add project asset grid/list, upload action, and asset detail panel.
- Dependencies: M6-T04.
- Expected Files: `apps/web/src/*`, `packages/ui/*`.
- Acceptance Criteria: User can upload, view, tag, and update project assets.

---

## Milestone 7: AI Job Foundation

### M7-T01: Define AI Provider Contracts
- Description: Define provider-agnostic AI job, prompt, provider call, and result contracts.
- Dependencies: M3-T01, M6-T01.
- Expected Files: `packages/ai/api/*`, `packages/types/*`, `docs/API.md`.
- Acceptance Criteria: Contracts do not expose GPT, Gemini, Flux, or other provider-specific assumptions.

### M7-T02: Add AI Job Persistence
- Description: Add persistence for `ai_jobs`, `ai_job_steps`, `ai_prompt_templates`, and `ai_provider_calls`.
- Dependencies: M7-T01.
- Expected Files: `packages/ai/infrastructure/*`, `packages/db/*`, `infra/migrations/*`.
- Acceptance Criteria: Jobs, steps, prompts, and provider calls are traceable.

### M7-T03: Implement AI Job Lifecycle
- Description: Implement queued, running, succeeded, failed, and canceled state transitions.
- Dependencies: M7-T02.
- Expected Files: `packages/ai/application/*`, `packages/ai/domain/*`.
- Acceptance Criteria: Invalid state transitions are rejected and failures are recorded.

### M7-T04: Integrate Credits with AI Jobs
- Description: Connect AI job creation to credit estimation, reservation, commit, and release.
- Dependencies: M3-T03, M7-T03.
- Expected Files: `packages/ai/application/*`, `packages/credits/api/*`.
- Acceptance Criteria: Paid AI jobs cannot run without successful credit reservation.

### M7-T05: Implement AI Job APIs
- Description: Add job creation, job status, and job events APIs.
- Dependencies: M7-T04.
- Expected Files: `apps/api/src/*`, `packages/ai/api/*`.
- Acceptance Criteria: Clients can create jobs and observe status without provider-specific fields.

---

## Milestone 8: Single Image Mode

### M8-T01: Define Single Image Workflow
- Description: Define the single image generation workflow using AI and Asset public interfaces.
- Dependencies: M7-T01, M6-T01.
- Expected Files: `packages/ai/application/*`, `packages/assets/api/*`, `docs/API.md`.
- Acceptance Criteria: Workflow covers prompt input, cost estimate, generation, asset save, and failure states.

### M8-T02: Implement Single Image API
- Description: Add API behavior for starting and tracking single image generation.
- Dependencies: M8-T01, M7-T05.
- Expected Files: `apps/api/src/*`, `packages/ai/application/*`.
- Acceptance Criteria: API returns job status and final asset reference on success.

### M8-T03: Add Single Image Page Form
- Description: Add prompt input, MVP generation settings, and cost preview.
- Dependencies: M8-T02.
- Expected Files: `apps/web/src/*`, `packages/ui/*`.
- Acceptance Criteria: User can enter prompt and see estimated credit cost before generation.

### M8-T04: Add Generation Progress and Result UI
- Description: Add progress display, generated image preview, save confirmation, and error states.
- Dependencies: M8-T03.
- Expected Files: `apps/web/src/*`, `packages/ui/*`.
- Acceptance Criteria: User can follow generation state and see success or failure clearly.

### M8-T05: Add Download Flow
- Description: Add download action for generated single images.
- Dependencies: M8-T04, M6-T04.
- Expected Files: `apps/web/src/*`, `apps/api/src/*`.
- Acceptance Criteria: User can download a completed generated image.

---

## Milestone 9: Idea Chat

### M9-T01: Define Idea Chat Contracts
- Description: Define thread, message, context snapshot, and AI response contracts.
- Dependencies: M5-T01, M7-T01.
- Expected Files: `packages/ideas/api/*`, `packages/types/*`, `docs/API.md`.
- Acceptance Criteria: Contracts support thread creation, message send, history retrieval, and project scoping.

### M9-T02: Add Idea Chat Persistence
- Description: Add persistence for `idea_threads`, `idea_messages`, and `idea_context_snapshots`.
- Dependencies: M9-T01.
- Expected Files: `packages/ideas/infrastructure/*`, `packages/db/*`, `infra/migrations/*`.
- Acceptance Criteria: Messages and context snapshots remain linked to the correct project.

### M9-T03: Implement Idea Chat APIs
- Description: Add thread list, thread create, thread read, and message send APIs.
- Dependencies: M9-T02, M7-T05.
- Expected Files: `apps/api/src/*`, `packages/ideas/application/*`.
- Acceptance Criteria: User can create a thread and send messages with AI job integration.

### M9-T04: Add Idea Chat UI
- Description: Add chat thread view, composer, message list, and loading/error states.
- Dependencies: M9-T03.
- Expected Files: `apps/web/src/*`, `packages/ui/*`.
- Acceptance Criteria: User can create and continue an idea thread from a project.

### M9-T05: Add Context and Credit Edge Handling
- Description: Add empty message, long context, insufficient credit, and failed response handling.
- Dependencies: M9-T03, M9-T04.
- Expected Files: `packages/ideas/application/*`, `apps/web/src/*`.
- Acceptance Criteria: Edge cases produce clear outcomes and correct credit behavior.

---

## Milestone 10: Characters

### M10-T01: Define Character Contracts
- Description: Define character, character version, and character asset reference contracts.
- Dependencies: M5-T01, M6-T01.
- Expected Files: `packages/characters/api/*`, `packages/types/*`, `docs/API.md`.
- Acceptance Criteria: Contracts support create, list, read, update, delete, versioning, and asset linking.

### M10-T02: Add Character Persistence
- Description: Add persistence for `characters`, `character_versions`, and `character_assets`.
- Dependencies: M10-T01.
- Expected Files: `packages/characters/infrastructure/*`, `packages/db/*`, `infra/migrations/*`.
- Acceptance Criteria: Characters are project-scoped and versioned.

### M10-T03: Implement Character APIs
- Description: Add character list, create, read, update, delete, and reference asset APIs.
- Dependencies: M10-T02.
- Expected Files: `apps/api/src/*`, `packages/characters/application/*`.
- Acceptance Criteria: Invalid names, duplicates, and unauthorized access are handled.

### M10-T04: Add Character List and Detail UI
- Description: Add character list, detail view, and create/edit form.
- Dependencies: M10-T03.
- Expected Files: `apps/web/src/*`, `packages/ui/*`.
- Acceptance Criteria: User can create, edit, view, and delete project characters.

### M10-T05: Add Character Asset Linking UI
- Description: Add ability to link an existing project asset as a character reference.
- Dependencies: M10-T03, M6-T05.
- Expected Files: `apps/web/src/*`, `packages/ui/*`.
- Acceptance Criteria: User can select an Asset Library item as a character reference.

---

## Milestone 11: Comic Studio

### M11-T01: Define Comic Studio Contracts
- Description: Define page, panel, bubble, layout version, and asset placement contracts.
- Dependencies: M5-T01, M6-T01, M10-T01.
- Expected Files: `packages/comic-studio/api/*`, `packages/types/*`, `docs/API.md`.
- Acceptance Criteria: Contracts support page creation, panel editing, bubble editing, asset placement, and layout versioning.

### M11-T02: Add Comic Studio Persistence
- Description: Add persistence for `comic_pages`, `comic_panels`, `comic_bubbles`, and `comic_layout_versions`.
- Dependencies: M11-T01.
- Expected Files: `packages/comic-studio/infrastructure/*`, `packages/db/*`, `infra/migrations/*`.
- Acceptance Criteria: Page layouts can be saved and reloaded without losing panels or bubbles.

### M11-T03: Implement Comic Studio APIs
- Description: Add page list, page create, page read, page update, panel update, and bubble update APIs.
- Dependencies: M11-T02.
- Expected Files: `apps/api/src/*`, `packages/comic-studio/application/*`.
- Acceptance Criteria: Invalid layouts and missing asset references are rejected clearly.

### M11-T04: Add Page Canvas and Navigator
- Description: Add Comic Studio page shell, page navigator, and canvas surface.
- Dependencies: M11-T03.
- Expected Files: `apps/web/src/*`, `packages/ui/*`.
- Acceptance Criteria: User can open Comic Studio and create or select a page.

### M11-T05: Add Panel Editing
- Description: Add panel creation, selection, resizing, moving, and persistence.
- Dependencies: M11-T04.
- Expected Files: `apps/web/src/*`, `packages/comic-studio/api/*`.
- Acceptance Criteria: User can add and edit panels and reload saved panel layout.

### M11-T06: Add Bubble and Asset Placement
- Description: Add text bubble editing and project asset placement into panels.
- Dependencies: M11-T05, M6-T05.
- Expected Files: `apps/web/src/*`, `packages/ui/*`.
- Acceptance Criteria: User can add bubbles, edit text, place assets, save, and reload the page.

---

## Milestone 12: Export

### M12-T01: Define Export Contracts
- Description: Define export job, export artifact, export status, and download contracts.
- Dependencies: M11-T01.
- Expected Files: `packages/export/api/*`, `packages/types/*`, `docs/API.md`.
- Acceptance Criteria: Contracts support job creation, status tracking, history, and download.

### M12-T02: Add Export Persistence
- Description: Add persistence for `export_jobs` and `export_artifacts`.
- Dependencies: M12-T01.
- Expected Files: `packages/export/infrastructure/*`, `packages/db/*`, `infra/migrations/*`.
- Acceptance Criteria: Export jobs and artifacts remain linked to the correct project and source content.

### M12-T03: Implement Export Job APIs
- Description: Add export create, status, history, and download API handlers.
- Dependencies: M12-T02.
- Expected Files: `apps/api/src/*`, `packages/export/application/*`.
- Acceptance Criteria: Export APIs handle missing pages, missing assets, failed jobs, and successful downloads.

### M12-T04: Implement Export Artifact Generation
- Description: Generate the MVP export artifact from saved Comic Studio content.
- Dependencies: M12-T03, M11-T03.
- Expected Files: `packages/export/application/*`, `packages/storage/api/*`.
- Acceptance Criteria: Completed export produces a downloadable artifact.

### M12-T05: Add Export UI
- Description: Add export action/page, status display, history, and download action.
- Dependencies: M12-T03, M12-T04.
- Expected Files: `apps/web/src/*`, `packages/ui/*`.
- Acceptance Criteria: User can start an export, track status, and download the completed artifact.

---

## Milestone 13: Version 1.0 Release Hardening

### M13-T01: Add MVP Smoke Tests
- Description: Add end-to-end smoke coverage for core authenticated MVP flows.
- Dependencies: M12-T05.
- Expected Files: `tests/*`, `apps/web/*`, `apps/api/*`.
- Acceptance Criteria: Smoke tests cover sign in, project creation, asset flow, generation entry point, Comic Studio, and export.

### M13-T02: Add Credit Regression Tests
- Description: Add focused tests for reservation, commit, release, refund, insufficient balance, and duplicate operations.
- Dependencies: M3-T05, M8-T05, M9-T05.
- Expected Files: `packages/credits/tests/*`, `packages/ai/tests/*`.
- Acceptance Criteria: Credit accounting remains correct across paid MVP flows.

### M13-T03: Review Error States
- Description: Audit user-facing error states across MVP pages and APIs.
- Dependencies: M12-T05.
- Expected Files: `apps/web/src/*`, `apps/api/src/*`, `packages/*/tests/*`.
- Acceptance Criteria: Known MVP edge cases produce clear UI and API responses.

### M13-T04: Sync Documentation
- Description: Update docs to match implemented behavior without expanding MVP scope.
- Dependencies: M13-T01, M13-T02, M13-T03.
- Expected Files: `docs/*`.
- Acceptance Criteria: `MVP.md`, `MVP_FREEZE.md`, `API.md`, `Database.md`, and `CHANGELOG.md` match implementation.

### M13-T05: Prepare Release Candidate
- Description: Add production deployment checklist and produce a release candidate build.
- Dependencies: M13-T04.
- Expected Files: `docs/CHANGELOG.md`, deployment config files, root scripts.
- Acceptance Criteria: Release candidate builds successfully and contains no out-of-scope features.

