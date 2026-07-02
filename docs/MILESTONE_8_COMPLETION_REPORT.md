# Milestone 8 Completion Report

## Milestone
Milestone 8: Single Image Mode

## Date
2026-07-02

## Verification Summary
Milestone 8 is complete.

The implementation adds a Single Image Mode workflow that accepts an MVP prompt/settings request, previews image-generation credit cost, creates a provider-agnostic AI image job, uses the Credits reservation lifecycle through AI, saves a generated artifact through the Asset Library, and exposes preview/download actions.

The workflow intentionally uses the Milestone 7 placeholder provider and a deterministic placeholder PNG artifact. Real image provider integration remains out of scope until explicitly approved.

## Deliverables

| Deliverable | Status | Evidence |
|---|---|---|
| Single Image Mode page | Complete | `/single-image-mode` |
| Prompt input | Complete | Prompt textarea on Single Image Mode page |
| Generation settings inside MVP scope | Complete | MVP style and aspect-ratio selectors |
| Credit cost preview | Complete | Image-generation estimate displayed before submit |
| Generation progress state | Complete | Generation status panel displays waiting/succeeded state |
| Generated image preview | Complete | Result card renders saved asset preview URL |
| Save result to Asset Library | Complete | Workflow saves output through `uploadAssetFile` |
| Download generated image | Complete | Result card exposes download link |

## Acceptance Criteria

| Acceptance Criterion | Status | Verification |
|---|---|---|
| A user can generate a single image. | Complete | Server action and `POST /v1/single-image/jobs` call AI workflow and return a saved asset result. |
| Cost is shown before generation. | Complete | Page displays `estimateAiJobCredits("image_generation")`. |
| Insufficient credits prevent generation. | Complete | AI job service reserves credits before provider execution and propagates insufficient-credit errors. |
| Successful output is saved as an asset. | Complete | Single Image workflow writes the generated artifact through the Assets public interface. |
| Provider failure produces a clear error and credit release/refund. | Complete | AI job foundation releases active reservations on provider failure; page and API return readable errors. |

## Checks Run

- `CI=true pnpm --filter @ai-comic/ai typecheck`
- `CI=true pnpm --filter @ai-comic/ai test`
- `CI=true pnpm --filter @ai-comic/web typecheck`
- `CI=true pnpm check`
- `CI=true pnpm test`
- `CI=true NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZS5jb20k CLERK_SECRET_KEY=sk_test_placeholder DATABASE_URL=postgres://postgres:postgres@localhost:5432/ai_comic_product pnpm build`

## Database Changes

No database migration was added for Milestone 8.

Milestone 8 reuses existing tables from earlier milestones:

- `ai_jobs`
- `ai_job_steps`
- `ai_prompt_templates`
- `ai_provider_calls`
- `credit_reservations`
- `credit_ledger_entries`
- `assets`
- `tags`
- `asset_tags`

## API Changes

Milestone 8 adds:

- `POST /v1/single-image/jobs`

The endpoint accepts a project id, prompt, optional MVP settings, and optional idempotency key. It returns the AI job id, saved asset id, preview URL, download URL, and status.

## Tests Added

- `packages/ai/src/tests/single-image-domain.test.ts`

The tests cover Single Image input defaults, prompt validation, strict rejection of unknown/provider-specific settings, and stable settings labels.

## Architecture Review

- UI calls a Server Action or `/v1/single-image/jobs`; it does not import provider SDKs.
- Single Image workflow lives in the AI module application layer and uses AI job contracts instead of provider-specific logic.
- AI continues to call Credits through the Credits public interface.
- Generated output is saved through the Assets public interface.
- Asset public URLs are resolved through Storage and are not persisted by the Single Image workflow.
- The workflow requires a target project because the Asset Library is project-scoped.

## Known Follow-Up

- Runtime-test Single Image Mode with a migrated PostgreSQL database.
- Replace the placeholder provider with an approved real image provider adapter in a future milestone or approved architectural change.
- Add richer progress polling if provider execution becomes asynchronous beyond the current placeholder flow.

## Explicitly Not Implemented

- Real OpenAI, Gemini, Flux, Claude, OpenRouter, or other model provider integration
- Character generation
- Comic generation
- Idea Chat changes
- Asset Library schema changes
- Credit pricing changes
- Subscription or billing changes
- Marketplace, collaboration, analytics, admin, enterprise, video, voice, translation, or motion comic features

## Next Recommended Milestone

Proceed to Milestone 9: Idea Chat.
