# API

## API Principles

- Backward compatibility first
- versioned endpoints
- additive changes preferred
- domain-owned routes
- asynchronous generation where needed
- public contracts only, no leaking internals

## Versioning

Use versioned API namespaces such as:
- `/v1/...`

Version changes are only required when a breaking change cannot be avoided.

## Domain-Based Route Groups

### Authentication and User Profile
- Clerk-owned routes provide Sign In, Sign Up, Sign Out, and session lifecycle behavior.
- `GET /v1/me`
- `PATCH /v1/me`

Version 1.0 does not implement custom password, login, logout, or session APIs.
The app-owned profile contract exposes only app-specific profile fields and the current authenticated user reference.

### Projects
- `GET /v1/projects`
- `POST /v1/projects`
- `GET /v1/projects/:projectId`
- `PATCH /v1/projects/:projectId`

Milestone 5 implements these endpoints through the Projects module public interface.
MVP project metadata is limited to `name` and `description`.
`PATCH /v1/projects/:projectId` accepts only `name` and `description`; unknown fields are rejected.
Simple metadata updates do not create project version records.

### Idea Chat
- `GET /v1/projects/:projectId/idea-threads`
- `POST /v1/projects/:projectId/idea-threads`
- `POST /v1/idea-threads/:threadId/messages`

### Characters
- `GET /v1/projects/:projectId/characters`
- `POST /v1/projects/:projectId/characters`
- `PATCH /v1/characters/:characterId`

### Assets
- `GET /v1/projects/:projectId/assets`
- `POST /v1/assets/upload-url`
- `POST /v1/assets`
- `GET /v1/assets/:assetId`
- `PATCH /v1/assets/:assetId`
- `DELETE /v1/assets/:assetId`

Milestone 6 implements these endpoints through the Assets module public interface.
Assets are scoped to projects and authenticated owners.
Asset records persist `storage_provider` and `storage_key` only; public URLs are resolved through the Storage module and are not persisted.
Asset statuses use the MVP lifecycle values `uploading`, `ready`, `failed`, `archived`, and `deleted`.
Tags are normalized through the shared `tags` table and `asset_tags` junction table.
Asset metadata uses flexible JSON object storage for asset-specific properties.
Uploading user files does not consume credits.

### Storage
- `GET /v1/storage/local/:storageKey`

Storage URLs are resolved by the Storage module and returned to callers as asset preview or access URLs.
Clients must not construct storage URLs directly.
Asset persistence must never store these public URLs.

### Comic Studio
- `GET /v1/projects/:projectId/comic-studio`
- `POST /v1/projects/:projectId/comic-pages`
- `PATCH /v1/comic-panels/:panelId`

### AI Generation
- `POST /v1/ai/jobs`
- `GET /v1/ai/jobs/:jobId`
- `GET /v1/ai/jobs/:jobId/events`

### Credits
- `GET /v1/credits/balance`
- `GET /v1/credits/ledger`
- `POST /v1/credits/reservations`
- `POST /v1/credits/reservations/:reservationId/commit`
- `POST /v1/credits/reservations/:reservationId/release`

Milestone 3 implements these endpoints as authenticated route handlers using the Credits module public interface.
Reservation requests accept `amount`, optional `idempotencyKey`, and optional `reason`.
Commit and release requests accept optional `idempotencyKey` and optional `reason`.
Insufficient-credit reservation attempts return an error and do not create a negative balance.

### Subscription
- `GET /v1/subscription`
- `GET /v1/subscription/plans`
- `POST /v1/subscription/checkout`
- `POST /v1/subscription/webhook`

Milestone 4 implements these endpoints through the Billing module public interface.
The checkout endpoint returns a provider-agnostic checkout session using the MVP placeholder adapter until a payment provider is approved.
Webhook requests accept provider event data and are processed idempotently by `provider` and `providerEventId`.
Subscription credit grants are recorded through the Credits public interface.

### Export
- `POST /v1/exports`
- `GET /v1/exports/:exportId`

## Request and Response Rules

- Requests must be validated at the boundary.
- Responses should use stable field names.
- Newly added response fields must be optional by default.
- Paginated endpoints should use a consistent pagination format.

## Async Job Contract

Long-running operations must return a job object immediately.

Required job fields:
- `id`
- `type`
- `status`
- `createdAt`
- `updatedAt`
- `estimatedCost`

Optional job fields:
- `progress`
- `resultRef`
- `error`

## Backward Compatibility Rules

- Do not remove fields from existing responses without a deprecation plan.
- Do not change meaning of fields silently.
- Add new endpoints rather than overloading old ones when behavior diverges.

## Documentation Requirement

Any API contract change must be reflected in `API.md` in the same pull request.
If a request would require a breaking API change, stop and request architectural approval first.

## Public Contract Requirements

Every endpoint group should have:
- input schema
- output schema
- error schema
- authorization rules
- idempotency rules where applicable

## AI API Rules

AI endpoints must never expose provider-specific assumptions to the client.

Client requests should describe intent, such as:
- generate an image
- refine a panel
- create a character reference
- draft an idea response

The server chooses the provider and workflow internally.
