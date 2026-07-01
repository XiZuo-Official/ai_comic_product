# Milestones

## Purpose

This document splits the frozen Version 1.0 MVP into implementation milestones.
Each milestone should take approximately 2-5 days, be independently testable, and be independently deployable.

## Rules

- Milestones must stay inside `MVP_FREEZE.md`.
- Each milestone must produce a deployable application state.
- Each milestone must include focused tests for its deliverables.
- Scope outside these milestones belongs to `FutureRoadmap.md` unless explicitly approved.
- If implementation reveals missing scope, stop and request approval before expanding Version 1.0.

---

## Milestone 1: Project Foundation

### Objective
Establish the application foundation, development workflow, environment configuration, deployable shell, Clerk authentication entry points, project CRUD, and project navigation placeholders.

### Deliverables
- Web app shell
- API app shell
- Shared TypeScript configuration
- Environment variable structure
- Health check endpoint
- Basic CI/check command
- Deployment-ready empty application
- Clerk Sign In, Sign Up, and Sign Out surfaces
- Home page with Single Image Mode and Projects entry points
- Project List with create, rename, delete, and open actions
- PostgreSQL-backed `projects` persistence
- Project layout sidebar with placeholder pages for Idea Chat, Characters, Asset Library, Comic Studio, and Export
- Global sidebar, top navigation, responsive layout, theme support, loading states, empty states, and error boundary
- Fake credit balance display in top navigation
- Subscription placeholder page

### Dependencies
- Frozen MVP docs
- Existing monorepo scaffold

### Acceptance Criteria
- App can run locally.
- API health check returns success.
- Shared checks can run from the repo root.
- Deployment can publish an authenticated-product shell.
- Clerk Sign In, Sign Up, and Sign Out routes render correctly.
- Project CRUD works against PostgreSQL.
- Project subpages render milestone placeholders.
- Fake credit balance is visible in top navigation.
- Subscription page renders a placeholder without payment integration.
- No AI, model provider, credits backend, or payment logic is implemented.

### Estimated Difficulty
Medium

---

## Milestone 2: Authentication and User Profile

### Objective
Allow a Clerk-authenticated user to access protected routes and manage app-owned profile information.

### Deliverables
- Clerk-backed Sign In page
- Clerk-backed Sign Out action
- Clerk-backed session handling
- Protected routes
- User Profile page
- `user_profiles` persistence
- Auth/Profile public contracts
- Current user and profile server actions

### Dependencies
- Milestone 1

### Acceptance Criteria
- Signed-out users cannot access protected pages.
- A user can sign in and sign out.
- Current Clerk-authenticated user can be retrieved through the Auth/Profile boundary.
- A user can view and update profile fields.
- Invalid profile updates show validation errors.
- No custom password, session, or identity persistence is introduced.

### Estimated Difficulty
Medium

---

## Milestone 3: Credits Ledger

### Objective
Create the credit accounting foundation used by all paid MVP actions.

### Deliverables
- Credit balance display
- Credit ledger view
- Credit account creation
- Credit reservation, commit, release, and refund behavior
- `credit_accounts`, `credit_ledger_entries`, `credit_reservations`, and `credit_refunds` persistence
- Credits APIs

### Dependencies
- Milestone 2

### Acceptance Criteria
- A user can view credit balance.
- Ledger entries are append-only.
- Credits can be reserved, committed, released, and refunded.
- Balance cannot become negative.
- Duplicate credit operations are handled safely.

### Estimated Difficulty
Medium-High

---

## Milestone 4: Subscription

### Objective
Allow users to view subscription state and receive subscription-based credit grants.

### Deliverables
- Subscription page
- Plan display
- Checkout entry point
- Subscription webhook handling
- Subscription credit grant flow
- `plans`, `subscriptions`, and `subscription_events` persistence
- Subscription APIs

### Dependencies
- Milestone 3

### Acceptance Criteria
- A user can view subscription status.
- A user can start checkout.
- Subscription webhook events are idempotent.
- Subscription credit grants are recorded in the credit ledger.
- Payment or renewal failures produce clear states.

### Estimated Difficulty
Medium-High

---

## Milestone 5: Projects

### Objective
Provide the project container that organizes all project-scoped MVP work.

### Deliverables
- Dashboard / Project List page
- Project Detail page
- Create project flow
- Edit project metadata flow
- Project access isolation
- `projects`, `project_settings`, and `project_versions` persistence
- Project APIs

### Dependencies
- Milestone 2

### Acceptance Criteria
- A user can create a project.
- A user can view only their own projects.
- A user can update project metadata.
- Project versions preserve relevant changes.
- Archived or inaccessible projects are handled clearly.

### Estimated Difficulty
Medium

---

## Milestone 6: Asset Library

### Objective
Allow users to upload, view, tag, and reuse project assets.

### Deliverables
- Asset Library page
- Upload URL flow
- Asset creation and metadata editing
- Asset grid or list
- Asset detail panel
- `assets`, `asset_variants`, and `asset_tags` persistence
- Asset APIs

### Dependencies
- Milestone 5

### Acceptance Criteria
- A user can upload an asset.
- A user can view project assets.
- A user can edit asset metadata.
- Unsupported file types and failed uploads show clear errors.
- Assets remain scoped to the correct project.

### Estimated Difficulty
Medium

---

## Milestone 7: AI Job Foundation

### Objective
Create the provider-agnostic AI job layer that supports paid text and image generation.

### Deliverables
- AI job creation API
- AI job status API
- AI job event/progress API
- Provider-agnostic adapter interface
- Prompt template versioning
- Provider call logging
- Credit estimate integration
- `ai_jobs`, `ai_job_steps`, `ai_prompt_templates`, and `ai_provider_calls` persistence

### Dependencies
- Milestone 3
- Milestone 6

### Acceptance Criteria
- AI jobs can be created and tracked.
- AI provider details do not leak into feature modules.
- AI jobs can reserve and finalize credits.
- Failed jobs release or refund credits according to credit rules.
- Provider calls are traceable for debugging.

### Estimated Difficulty
High

---

## Milestone 8: Single Image Mode

### Objective
Allow a user to generate one image from a prompt and save the result as an asset.

### Deliverables
- Single Image Mode page
- Prompt input
- Generation settings inside MVP scope
- Credit cost preview
- Generation progress state
- Generated image preview
- Save result to Asset Library
- Download generated image

### Dependencies
- Milestone 6
- Milestone 7

### Acceptance Criteria
- A user can generate a single image.
- Cost is shown before generation.
- Insufficient credits prevent generation.
- Successful output is saved as an asset.
- Provider failure produces a clear error and credit release/refund.

### Estimated Difficulty
High

---

## Milestone 9: Idea Chat

### Objective
Allow a user to brainstorm ideas inside a project using AI text generation.

### Deliverables
- Idea Chat page
- Thread creation
- Message composer
- Conversation history
- Project context snapshot
- Credit usage for paid AI messages
- `idea_threads`, `idea_messages`, and `idea_context_snapshots` persistence
- Idea Chat APIs

### Dependencies
- Milestone 5
- Milestone 7

### Acceptance Criteria
- A user can create and continue an idea thread.
- Messages persist and remain project-scoped.
- AI responses consume credits according to credit rules.
- Empty messages and failed AI responses are handled clearly.
- Long context cases fail gracefully.

### Estimated Difficulty
Medium-High

---

## Milestone 10: Characters

### Objective
Allow a user to create and manage project characters.

### Deliverables
- Characters page
- Character list
- Character create/edit form
- Character detail view
- Character reference asset linking
- `characters`, `character_versions`, and `character_assets` persistence
- Character APIs

### Dependencies
- Milestone 5
- Milestone 6

### Acceptance Criteria
- A user can create, edit, view, and delete characters.
- Character records are scoped to a project.
- Duplicate or invalid character names are handled clearly.
- Character version history captures relevant changes.
- Character reference assets can be linked from the Asset Library.

### Estimated Difficulty
Medium

---

## Milestone 11: Comic Studio

### Objective
Allow a user to create and edit comic pages using panels, bubbles, and assets.

### Deliverables
- Comic Studio page
- Page navigator
- Page canvas
- Panel creation and editing
- Bubble creation and editing
- Asset placement from Asset Library
- Layout save and reload
- `comic_pages`, `comic_panels`, `comic_bubbles`, and `comic_layout_versions` persistence
- Comic Studio APIs

### Dependencies
- Milestone 5
- Milestone 6
- Milestone 10

### Acceptance Criteria
- A user can create a comic page.
- A user can add and edit panels.
- A user can add and edit text bubbles.
- A user can place project assets into panels.
- Saved layouts reopen correctly.
- Invalid layouts and missing asset references are handled clearly.

### Estimated Difficulty
High

---

## Milestone 12: Export

### Objective
Allow a user to export project comic content into downloadable artifacts.

### Deliverables
- Export page or project export action
- Export settings inside MVP scope
- Export job creation
- Export status tracking
- Downloadable export artifact
- Export history
- `export_jobs` and `export_artifacts` persistence
- Export APIs

### Dependencies
- Milestone 11

### Acceptance Criteria
- A user can start an export job.
- Export status is visible while processing.
- Completed exports can be downloaded.
- Export history is preserved.
- Missing pages, missing assets, and failed exports show clear states.

### Estimated Difficulty
Medium-High

---

## Milestone 13: Version 1.0 Release Hardening

### Objective
Stabilize the full frozen MVP for public release without adding new product scope.

### Deliverables
- End-to-end MVP smoke tests
- Cross-feature regression checks
- Error state review
- Documentation sync review
- Production deployment checklist
- Release candidate build

### Dependencies
- Milestone 12

### Acceptance Criteria
- All MVP pages can be reached by an authenticated user.
- Core happy paths pass end-to-end.
- Credit charges and refunds remain correct across AI flows.
- Export works from saved Comic Studio content.
- Documentation matches implemented behavior.
- No out-of-scope features are present.

### Estimated Difficulty
Medium
