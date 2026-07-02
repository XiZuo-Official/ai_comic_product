# CHANGELOG

## Purpose
This document records user-visible changes to the architecture and product documentation.

## Versioning Rule
Keep entries short, dated, and additive.

## Template
- Date
- Change
- Why it changed
- Documents updated

## Note
Implementation changes that affect architecture, APIs, schema, or business rules must be accompanied by matching documentation updates.

## 2026-07-02

- Change: Implemented Milestone 7 AI Job Foundation and marked it complete.
- Why it changed: AI jobs now have provider-agnostic contracts, lifecycle persistence, prompt template versioning, provider call logging, placeholder adapter execution, and credit reservation/finalization behavior.
- Documents updated: `API.md`, `Database.md`, `Decisions.md`, `FolderStructure.md`, `MVP.md`, `MILESTONES.md`, `MILESTONE_7_COMPLETION_REPORT.md`, `CHANGELOG.md`.

- Change: Implemented Milestone 6 Asset Library and marked it complete.
- Why it changed: Assets now have isolated module contracts, storage-provider-independent references, normalized tags, explicit lifecycle status, upload and metadata APIs, project-scoped UI, and focused domain tests.
- Documents updated: `API.md`, `Database.md`, `Decisions.md`, `MVP.md`, `MILESTONES.md`, `MILESTONE_6_COMPLETION_REPORT.md`, `CHANGELOG.md`.

- Change: Implemented Milestone 5 Projects and marked it complete.
- Why it changed: Projects now have formal contracts, modular package boundaries, strict MVP metadata updates, documented APIs, additive metadata persistence, and focused domain tests.
- Documents updated: `API.md`, `Database.md`, `Decisions.md`, `MVP.md`, `MILESTONES.md`, `MILESTONE_5_COMPLETION_REPORT.md`, `CHANGELOG.md`.

## 2026-07-01

- Change: Implemented Milestone 4 Subscription and marked it complete.
- Why it changed: Billing now has provider-agnostic subscription contracts, persistence, idempotent webhook handling, checkout entry points, subscription UI, and subscription credit grants through Credits.
- Documents updated: `API.md`, `Database.md`, `Decisions.md`, `MILESTONES.md`, `MILESTONE_4_COMPLETION_REPORT.md`, `CHANGELOG.md`.

- Change: Implemented Milestone 3 Credits Ledger and marked it complete.
- Why it changed: Credits now have domain contracts, persistence, reservation lifecycle behavior, authenticated APIs, a user-facing balance/ledger view, and focused domain tests.
- Documents updated: `Database.md`, `API.md`, `MILESTONES.md`, `MILESTONE_3_COMPLETION_REPORT.md`, `CHANGELOG.md`.

- Change: Marked Milestone 2 Authentication and User Profile as complete and added the completion report.
- Why it changed: Verification confirmed the implemented Clerk-backed auth/profile boundary satisfies the documented Milestone 2 deliverables and acceptance criteria.
- Documents updated: `MILESTONES.md`, `MILESTONE_2_COMPLETION_REPORT.md`, `CHANGELOG.md`.

- Change: Clarified Milestone 2 authentication ownership around Clerk-managed auth and app-owned profile persistence.
- Why it changed: The project already approved Clerk for authentication, and duplicate custom session or identity tables would violate maintainability and stability goals.
- Documents updated: `Decisions.md`, `Database.md`, `API.md`, `MILESTONES.md`, `TASK_BREAKDOWN.md`, `IMPLEMENTATION_ORDER.md`, `MVP.md`, `MVP_FREEZE.md`.

- Change: Added approved Milestone 1A foundation scope and implementation artifacts.
- Why it changed: The first implementation pass was explicitly expanded to include Clerk auth entry points, project CRUD, global layout, project placeholders, fake credit display, and subscription placeholder.
- Documents updated: `Decisions.md`, `MILESTONES.md`, `TASK_BREAKDOWN.md`, `IMPLEMENTATION_ORDER.md`, `MVP_FREEZE.md`, `Database.md`.
