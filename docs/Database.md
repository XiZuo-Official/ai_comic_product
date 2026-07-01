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
- `users`
- `workspaces`
- `workspace_members`

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

## Versioning Rules

- `project_versions`, `character_versions`, and `comic_layout_versions` preserve historical snapshots.
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
