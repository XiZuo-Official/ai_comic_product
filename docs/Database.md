# Database

## Database Philosophy
The database must support:

- additive evolution
- backward compatibility
- strong ownership by domain
- auditable changes
- non-destructive migrations
- documentation-driven decision making

PostgreSQL is the primary database.

## General Rules

- Use UUID primary keys.
- Use timestamp fields consistently.
- Prefer explicit columns for core business data.
- Use JSONB only for flexible metadata, not for core invariants.
- Never assume future features need shared tables.
- Avoid cross-domain foreign keys unless the relationship is truly foundational.

## MVP Tables by Domain

### Users and Access
- `user_profiles`

Clerk owns authentication, external identity, and session records for Version 1.0.
The application database stores only app-owned profile fields in `user_profiles`, keyed by the authenticated external user id.
The app must not store passwords, session tokens, or duplicate identity-provider credentials.

### Projects
- `projects`
- `project_settings`
- `project_versions`

Milestone 1A implements the Projects tables first.
Project records are scoped by the authenticated Clerk user id stored as `projects.owner_id`.
Project deletion is implemented as a soft delete through `projects.deleted_at`.

### Idea Chat
- `idea_threads`
- `idea_messages`
- `idea_context_snapshots`

### Characters
- `characters`
- `character_versions`
- `character_assets`

### Assets
- `assets`
- `asset_variants`
- `tags`
- `asset_tags`

### Comic Studio
- `comic_projects`
- `comic_pages`
- `comic_panels`
- `comic_bubbles`
- `comic_layout_versions`

### AI Orchestration
- `ai_jobs`
- `ai_job_steps`
- `ai_prompt_templates`
- `ai_provider_calls`

### Credits
- `credit_accounts`
- `credit_ledger_entries`
- `credit_reservations`
- `credit_refunds`

### Subscription
- `plans`
- `subscriptions`
- `subscription_events`

### Export
- `export_jobs`
- `export_artifacts`

## Ownership Rules

Each table must have a clear owning module:
- Project data belongs to Projects.
- Billing data belongs to Credits and Subscription.
- Media data belongs to Assets or Export.
- AI execution data belongs to AI Orchestration.

No module should write directly to another module’s tables.

## Migration Rules

### Non-Destructive First
All migrations must preserve existing data by default.

Allowed patterns:
- add columns
- add tables
- add indexes
- backfill new fields safely
- add nullable fields before making them required

Disallowed patterns unless explicitly approved:
- dropping columns that still have consumers
- rewriting data in place without fallback
- destructive normalization without a transition period

### Safe Change Process
1. Add new schema shape.
2. Write to both old and new shapes if needed.
3. Backfill existing records.
4. Move readers to the new shape.
5. Deprecate old shape later.

## Documentation Requirement

Any change to database relationships, constraints, ownership, or migration strategy must be documented in `Database.md` before implementation and updated in the same pull request as the code change.

## Milestone 1A Migration

`infra/migrations/0001_milestone_1a_projects.sql` creates:
- `projects`
- `project_settings`
- `project_versions`

This migration is additive and does not remove existing data.

## Milestone 2 Migration

`infra/migrations/0002_milestone_2_user_profiles.sql` creates:
- `user_profiles`

This migration is additive and does not remove existing data.
`user_profiles.auth_user_id` stores the authenticated external user id from Clerk for Version 1.0.
Only the Auth/Profile module may write this table.

## Milestone 3 Migration

`infra/migrations/0003_milestone_3_credits.sql` creates:
- `credit_accounts`
- `credit_ledger_entries`
- `credit_reservations`
- `credit_refunds`

This migration is additive and does not remove existing data.
The Credits module owns all writes to these tables.
Ledger entries are append-only through the Credits public interface.
Reservations deduct available balance before paid work; commits, releases, and refunds are recorded as separate auditable events.

## Milestone 4 Migration

`infra/migrations/0004_milestone_4_subscription.sql` creates:
- `plans`
- `subscriptions`
- `subscription_events`

This migration is additive and does not remove existing data.
The Subscription/Billing module owns all writes to these tables.
`subscription_events` are idempotent by provider event id.
Subscription credit grants must be applied through the Credits public interface and recorded in the credit ledger.
The migration seeds the placeholder `mvp_creator` plan so the MVP can display and test subscription behavior before a real payment provider is approved.

## Milestone 5 Migration

`infra/migrations/0005_milestone_5_projects.sql` adds:
- nullable `projects.description`

This migration is additive and does not remove existing data.
The Projects module owns project metadata writes.
MVP project metadata is limited to `name` and `description`.
Project versions remain available for meaningful project state changes, but simple metadata updates such as `name` or `description` edits do not automatically create project version records.

## Milestone 6 Migration

`infra/migrations/0006_milestone_6_assets.sql` creates:
- `assets`
- `asset_variants`
- `tags`
- `asset_tags`

This migration is additive and does not remove existing data.
The Assets module owns asset records, asset variants, tag assignments, and asset metadata writes.
The reusable `tags` table normalizes tag names per owner; `asset_tags` is the junction table between assets and tags.
Asset records persist only `storage_provider` and `storage_key`; public URLs must be resolved through the Storage module and must not be stored in asset tables.
Asset-specific properties use `metadata` JSONB so the schema does not become image-only.
Asset lifecycle is explicit through `status`, initially `uploading`, `ready`, `failed`, `archived`, and `deleted`.

## Milestone 7 Migration

`infra/migrations/0007_milestone_7_ai_jobs.sql` creates:
- `ai_jobs`
- `ai_job_steps`
- `ai_prompt_templates`
- `ai_provider_calls`

This migration is additive and does not remove existing data.
The AI module owns all writes to these tables.
AI jobs store provider-agnostic job type, status, prompt, prompt template version, input metadata, result metadata, estimated cost, progress, and credit reservation reference.
The `credit_reservation_id` value is stored as a reference without a cross-domain foreign key so Credits remains the owner of credit accounting.
Prompt templates are versioned by `template_key` and `version`.
Provider call records are internal observability records for debugging and must not become feature-module contracts.

## Milestone 8 Migration

No database migration was added for Milestone 8.
Single Image Mode reuses AI, Credits, Assets, Tags, and Storage persistence from earlier milestones.

## Milestone 9 Migration

`infra/migrations/0008_milestone_9_idea_chat.sql` creates:
- `idea_threads`
- `idea_messages`
- `idea_context_snapshots`

This migration is additive and does not remove existing data.
The Ideas module owns all writes to these tables.
Idea threads are scoped by authenticated owner and project.
Idea messages belong to idea threads and preserve user and assistant conversation history.
Idea context snapshots capture the project context and recent conversation used for each AI-assisted response.
AI job references are stored as ids without making AI provider internals part of the Ideas module contract.

## Milestone 10 Migration

`infra/migrations/0009_milestone_10_characters.sql` creates:
- `characters`
- `character_versions`
- `character_assets`

This migration is additive and does not remove existing data.
The Characters module owns all writes to these tables.
Characters are scoped by authenticated owner and project.
Character duplicate handling uses normalized names within active project records.
Character deletion is soft deletion through `characters.deleted_at` and `characters.status`.
Character versions store JSON snapshots for create, update, delete, and reference changes.
`character_assets` stores reference asset ids without duplicating asset metadata; asset validity is checked through the Assets public interface.

## Versioning Rules

- `project_versions`, `character_versions`, and `comic_layout_versions` preserve historical snapshots.
- Project versions should be reserved for meaningful project state changes, not routine MVP metadata edits.
- AI prompts and provider payloads should be versioned.
- Export jobs should record the exact input version used.

## Credit Ledger Rules

The credit system must be append-only for accounting history.

Required patterns:
- reserves must be recorded
- commits must be recorded
- refunds must be recorded
- manual adjustments must be recorded

The current balance can be derived or cached, but the ledger is authoritative.

## Data Isolation Rules

Tenant boundaries must be respected.
- workspace-scoped records must remain workspace-scoped
- project-scoped records must remain project-scoped
- avoid leaking access across workspace boundaries

## Retention and Archival

Prefer status flags or archival tables over deletion for:
- AI job history
- credit history
- project history
- export artifacts

This keeps the system auditable and backward compatible.
