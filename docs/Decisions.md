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
