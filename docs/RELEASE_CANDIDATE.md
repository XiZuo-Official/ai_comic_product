# Release Candidate

## Purpose

This document defines the Version 1.0 release-hardening checklist.
It does not add product scope.
It exists to verify that the frozen MVP is stable, documented, deployable, and safe to release.

## Scope

Milestone 13 covers only:
- end-to-end MVP smoke verification
- cross-feature regression checks
- error state review
- documentation sync review
- production deployment checklist
- release candidate build
- database rollback review
- logging review
- rate limiting review
- operational monitoring review

Milestone 13 does not add marketplace, collaboration, studio mode, reading platform, admin, analytics, enterprise, multi-agent, video, voice, translation, motion comic, team collaboration, public publishing, or payment-provider integration behavior.

## End-To-End Verification Checklist

- Signed-out users cannot access authenticated pages.
- Sign In, Sign Up, Sign Out, and User Profile are reachable.
- Home exposes only Single Image Mode and Projects entry points.
- Project create, open, metadata edit, and archive/delete flows work.
- Asset Library upload, list, metadata edit, delete, and download flows work.
- Single Image Mode shows cost, creates a provider-agnostic image job, commits credits, saves an asset, and exposes preview/download.
- Idea Chat creates project threads, sends messages, stores history, commits credits, and records failed assistant messages on failure.
- Characters create, edit, delete, duplicate-name validation, versioning, and asset references work.
- Comic Studio creates pages, panels, bubbles, asset placements, layout versions, and reloads saved layouts.
- Export creates an HTML export from saved Comic Studio content, records status/history, and downloads the artifact.
- Credits balance, ledger, reservation, commit, release, refund, insufficient balance, and duplicate operation cases remain correct.
- Subscription plan display, placeholder checkout, webhook idempotency, and subscription credit grants work.

## Regression Testing Plan

- Run `CI=true pnpm check`.
- Run `CI=true pnpm test`.
- Run `CI=true NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZS5jb20k CLERK_SECRET_KEY=sk_test_placeholder DATABASE_URL=postgres://postgres:postgres@localhost:5432/ai_comic_product pnpm build`.
- Run MVP release smoke tests under `tests/`.
- Run focused Credits and AI regression tests for paid MVP flows.
- Verify strict API endpoints reject unknown future fields.
- Verify storage references persist `storage_provider` and `storage_key`, not public URLs.
- Verify no future-roadmap route groups are present in the app tree.

## Database Rollback Review

Version 1.0 migrations are additive and ordered from `0001` through `0011`.
Production migrations should be applied forward-only after a database backup has been captured.

Rollback strategy:
- Prefer restoring from a pre-migration backup for failed production rollout recovery.
- Do not drop columns or tables as an automatic rollback step.
- If a release must be rolled back at the application layer, deploy the prior app version while preserving the migrated schema.
- Because migrations are additive, older app versions should tolerate unused tables and columns.
- If data repair is required, create a documented follow-up migration or script after approval.

Migration safety checks:
- No Version 1.0 migration should contain destructive `DROP` or `TRUNCATE` operations.
- Migrations must preserve existing data.
- Migrations must be applied in filename order.
- Production migration logs should be retained with the release record.

## Logging Review

Important server-side operations should produce meaningful logs in production without exposing secrets, prompts beyond approved observability policy, raw provider payloads, credit secrets, Clerk secrets, database URLs, storage file contents, or webhook secrets.

Recommended logged events:
- authentication and authorization failures by route and status only
- project create/update/archive failures
- upload and storage failures
- AI job lifecycle failures
- credit reservation, commit, release, and refund failures
- subscription webhook failures and duplicate webhook detection
- Comic Studio save failures
- export creation and download failures

Logging requirements:
- Logs must not include `CLERK_SECRET_KEY`, `DATABASE_URL`, provider credentials, raw files, or private storage contents.
- Logs should include stable ids such as job id, project id, export id, and request route where safe.
- Logs should distinguish validation failure, authorization failure, provider failure, and persistence failure.
- Logging changes that alter business behavior require normal documentation sync.

## Rate Limiting Review

No rate limiting implementation is required in Milestone 13.
The following endpoints should require production rate limiting before broad public launch:
- `POST /v1/ai/jobs`
- `POST /v1/single-image/jobs`
- `POST /v1/idea-threads/:threadId/messages`
- `POST /v1/assets/upload-url`
- `POST /v1/assets`
- `POST /v1/exports`
- `POST /v1/subscription/checkout`
- `POST /v1/subscription/webhook`
- `POST /v1/credits/reservations`
- authentication entry points managed by Clerk

Recommended rate limit dimensions:
- authenticated user id
- project id for project-scoped writes
- route group
- IP address for unauthenticated/provider callbacks where applicable
- idempotency key for retry-safe endpoints

## Operational Review

Recommended production metrics:
- failed sign-ins and authorization failures
- project create/update/archive failures
- asset upload attempts, upload failures, and unsupported file failures
- storage read/write failures
- AI job created, succeeded, failed, and canceled counts
- AI provider failure counts and latency
- credit reservation failures, insufficient-credit failures, commit failures, release failures, and refund failures
- subscription checkout starts, webhook failures, duplicate webhook events, and credit grant failures
- Idea Chat message failures and context-too-large failures
- Comic Studio save failures and invalid layout failures
- export job created, completed, failed, and download failure counts
- production build/deploy health
- database migration success/failure

Recommended alerts:
- spike in AI failures
- spike in credit accounting failures
- failed subscription webhook processing
- failed export generation
- storage write/read failure spike
- repeated migration failure
- authenticated route authorization anomaly

## Error Handling Review

- User-facing errors must be clear and recoverable.
- API errors must use stable response shape `{ "error": "message" }`.
- Validation failures should return `400`.
- Authentication failures should return `401`.
- Missing owned resources should return `404`.
- Failed AI jobs should release active reservations.
- Failed exports should preserve a failed job in export history.
- Failed webhooks should not create duplicate credit grants.

## Performance Review

- Project pages should avoid unnecessary cross-module loading.
- Asset and export downloads should stream or return bounded responses appropriate to MVP file sizes.
- Export generation should remain scoped to saved Comic Studio pages only.
- Production build output should be reviewed before release.
- Any performance optimization must not introduce new product scope or cross-module coupling.

## Security Review

- Clerk protects authenticated app routes.
- Owner scoping is required for all user-owned data.
- Storage artifacts must be read through Storage public interfaces.
- Public URLs must not be persisted in Asset or Export tables.
- AI provider internals must not leak into feature APIs.
- Secrets must not appear in logs, docs, test snapshots, or client responses.
- Future admin, analytics, marketplace, collaboration, and reading-platform surfaces must not exist in Version 1.0.

## Accessibility Review

- MVP pages should be keyboard reachable.
- Inputs should have labels.
- Icon-only buttons should have accessible labels.
- Images should have useful alt text.
- Error, empty, and loading states should be perceivable.
- Light and dark themes should maintain readable contrast.
- Responsive layouts should remain usable on mobile widths.

## Environment Configuration Review

Required variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`

Optional variables:
- `LOCAL_STORAGE_DIR`
- `PORT` for the API health service

Release checks:
- `.env.example` documents required local variables.
- Missing required variables fail clearly.
- Production build receives required variables.
- Migrations run against the intended production database.
- Storage location is persistent in production.

## Production Deployment Checklist

- Install dependencies from the lockfile.
- Configure Clerk production keys.
- Configure PostgreSQL `DATABASE_URL`.
- Configure persistent storage for local storage adapter or approved production storage adapter.
- Apply migrations in order from `0001` to `0011`.
- Run `CI=true pnpm check`.
- Run `CI=true pnpm test`.
- Run production build.
- Start web app and API health service.
- Verify protected route behavior.
- Verify upload, AI placeholder generation, credit accounting, Comic Studio save, export, and download flows.
- Verify no out-of-scope routes are present.

## Release Checklist

- M13-T01 MVP smoke tests pass.
- M13-T02 credit regression tests pass.
- M13-T03 error state review is complete.
- M13-T04 documentation sync is complete.
- M13-T05 release candidate build succeeds.
- `docs/MILESTONE_13_COMPLETION_REPORT.md` is created.
- `docs/CHANGELOG.md` is updated.
- Version 1.0 release is explicitly approved.

## Release Gate

Version 1.0 can only be considered release-ready if:
- All acceptance criteria pass.
- Smoke tests pass.
- Build succeeds.
- Database migrations succeed.
- Documentation matches implementation.
- No architecture violations remain.
