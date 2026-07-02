# Decisions

## Purpose
This document records architectural and product decisions that need to remain stable over time.

## Decision Log Format
- Date
- Decision
- Context
- Alternatives considered
- Trade-offs
- Approval status

## Rules
- Record decisions before implementation whenever possible.
- If a decision changes architecture, APIs, schema, or business rules, update the relevant source document in the same pull request.
- If the decision is architectural and material, human approval is required before implementation.

## Decision Log

### 2026-07-01: Approve Milestone 1A Foundation Scope

- Decision: Milestone 1 is expanded into Milestone 1A for the first implementation pass.
- Context: The original Milestone 1 covered only app shells, environment configuration, and health checks. The approved implementation request requires Clerk authentication pages, project CRUD with PostgreSQL, project navigation placeholders, fake top-nav credit display, and subscription placeholder UI in the foundation pass.
- Alternatives considered: Keep the original Milestone 1 only, or start strictly from Task 001 and defer auth/projects to later milestones.
- Trade-offs: Milestone 1A creates a more useful deployable shell earlier, but it intentionally reorders some UI and persistence work ahead of the original task sequence. AI, model providers, credits backend logic, and payment integration remain excluded.
- Approval status: Approved by user on 2026-07-01.

### 2026-07-01: Use Clerk for Authentication

- Decision: Clerk is the authentication provider for Version 1.0 application foundation.
- Context: The user explicitly requested Clerk for Sign In, Sign Up, and Sign Out.
- Alternatives considered: Custom auth tables and session logic, or another managed auth provider.
- Trade-offs: Clerk reduces authentication implementation risk and speeds up secure session handling, while introducing a core external dependency that must remain isolated behind auth boundaries.
- Approval status: Approved by user on 2026-07-01.

### 2026-07-01: Clerk Owns Auth, App Owns User Profile

- Decision: Version 1.0 will not implement custom password, login, logout, session, or identity tables. Clerk remains the source of truth for authentication/session lifecycle, while the application owns `user_profiles` for app-specific profile fields.
- Context: Milestone 1A already introduced Clerk authentication entry points. The older Milestone 2 plan referenced custom `users`, `sessions`, and `auth_identities` persistence, which would duplicate Clerk responsibilities and increase regression risk.
- Alternatives considered: Build a parallel custom auth system, keep custom user/session tables synchronized with Clerk, or store only app-owned profile data keyed by Clerk's authenticated user id.
- Trade-offs: Relying on Clerk keeps secure auth behavior provider-managed and reduces implementation risk. The app must keep Clerk usage isolated behind auth/profile boundaries so a future auth provider migration can happen through adapters rather than broad business-logic edits.
- Approval status: Approved by user on 2026-07-01.

### 2026-07-01: Use Server Actions for Milestone 1A Project CRUD

- Decision: Milestone 1A project create, rename, delete, and open behavior is implemented through Next.js Server Actions calling the Projects module public interface.
- Context: The approved Milestone 1A scope asks for a production-ready project list before the standalone API milestone is reached.
- Alternatives considered: Implement full `/v1/projects` API endpoints immediately, or keep project CRUD out of Milestone 1A.
- Trade-offs: Server Actions keep the first deployable shell small and preserve domain isolation through `packages/projects`; public REST project APIs remain documented for their later milestone.
- Approval status: Approved as part of Milestone 1A implementation.

### 2026-07-01: Use Provider-Agnostic Subscription Placeholder for Milestone 4

- Decision: Milestone 4 implements Billing/Subscription with a provider-agnostic placeholder checkout adapter and an `mvp_creator` seed plan until a real payment provider is explicitly approved.
- Context: The frozen MVP requires plan display, checkout entry point, webhook handling, and subscription credit grants, but no payment provider or production pricing has been selected.
- Alternatives considered: Integrate Stripe immediately, integrate another billing provider immediately, or delay Milestone 4 until provider selection.
- Trade-offs: The placeholder adapter keeps module contracts, persistence, UI, webhook idempotency, and credit grant behavior testable without locking the architecture to a provider. A real provider can later be added as a Billing adapter without redesigning Subscription or Credits.
- Approval status: Approved by user on 2026-07-01 as part of the Milestone 4 plan.

### 2026-07-02: Limit Milestone 5 Project Metadata and Version Creation

- Decision: Milestone 5 project metadata is limited to `name` and `description`. Simple metadata edits must not automatically create `project_versions` records.
- Context: The docs require project metadata editing and project version persistence, but do not define metadata fields or which changes should create versions.
- Alternatives considered: Allow a generic metadata object, allow arbitrary PATCH fields, or create project versions for every metadata edit.
- Trade-offs: Limiting metadata keeps the MVP stable and avoids accidental future scope. Preserving the versioning mechanism without recording routine metadata edits keeps the audit trail useful for future meaningful state snapshots.
- Approval status: Approved by user on 2026-07-02.

### 2026-07-02: Normalize Asset Tags and Keep Storage Provider-Agnostic

- Decision: Milestone 6 assets use a reusable `tags` table with an `asset_tags` junction table, persist only `storage_provider` and `storage_key`, expose explicit asset status values, and store flexible asset-specific properties in JSON metadata.
- Context: The Asset Library needs upload, tagging, metadata, and future reuse without hard-coding image-only assumptions or provider-specific public URLs.
- Alternatives considered: Store duplicated tag names directly on assets, persist public URLs, model only image dimensions and image-specific fields, or defer statuses until later.
- Trade-offs: Normalized tags and storage indirection add a little more schema and service code now, but protect future provider swaps, non-image assets, and cross-feature asset reuse. Flexible metadata avoids premature schema churn while preserving explicit columns for core invariants.
- Approval status: Approved by user on 2026-07-02 before Milestone 6 implementation.

### 2026-07-02: Use Placeholder AI Provider Adapter for Milestone 7

- Decision: Milestone 7 uses a deterministic placeholder AI provider adapter and fixed MVP credit estimates of 5 credits for `text_generation` jobs and 20 credits for `image_generation` jobs.
- Context: The roadmap requires provider-agnostic AI jobs, prompt versioning, provider call logging, and credit reservation/finalization before feature-specific generation or real provider selection.
- Alternatives considered: Integrate OpenAI or another provider immediately, defer credit integration until Single Image Mode, or allow clients to submit arbitrary credit costs.
- Trade-offs: The placeholder adapter proves lifecycle, persistence, provider boundaries, and credit behavior without coupling the product to a vendor. Fixed estimates are intentionally conservative MVP infrastructure rules and can be extended through AI module contracts later.
- Approval status: Approved by user on 2026-07-02 as part of Milestone 7 implementation approval.

### 2026-07-02: Implement Single Image Mode Through AI and Assets Public Interfaces

- Decision: Milestone 8 Single Image Mode creates provider-agnostic `image_generation` jobs through the AI module, saves generated output through the Assets module, and requires a target project because assets are project-scoped.
- Context: The frozen MVP requires Single Image Mode to generate one image, show credit cost, save successful output to Asset Library, and support download. No real image provider has been selected or approved.
- Alternatives considered: Integrate a real image provider immediately, store generated images outside projects, or let the UI call AI and Asset internals directly.
- Trade-offs: Requiring a project keeps generated output aligned with existing Asset Library ownership. Using the placeholder provider and deterministic placeholder PNG keeps the workflow testable without vendor coupling, while real provider integration can later be added behind the AI provider adapter.
- Approval status: Approved by user on 2026-07-02 as part of Milestone 8 implementation approval.

### 2026-07-02: Implement Idea Chat as an Isolated Ideas Module

- Decision: Milestone 9 Idea Chat owns thread state, message history, and context snapshots in `packages/ideas`, while AI text generation and credit reservation remain owned by the AI Job Foundation.
- Context: The frozen MVP requires project-scoped ideation threads, persistent history, AI text responses, context snapshots, and credit usage without introducing real provider SDKs or future multi-agent behavior.
- Alternatives considered: Store chat messages in Projects, call AI directly from the UI, or introduce a real text provider immediately.
- Trade-offs: A dedicated Ideas module keeps chat rules independent from Projects and AI internals. Using the existing placeholder AI provider keeps provider selection deferred while validating persistence, credits, context, and UI behavior.
- Approval status: Approved by user on 2026-07-02 as part of Milestone 9 implementation approval.
