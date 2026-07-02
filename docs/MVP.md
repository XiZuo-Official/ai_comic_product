# MVP

## Purpose

This document defines Version 1.0 of the product.
It is the only scope that may be implemented for the first public release.

## MVP Principles

- Only include what is required for the first public release.
- Do not design future features here.
- Do not include roadmap features except in the Out of Scope section.
- Keep the scope small, stable, and testable.
- If a feature is not explicitly listed here, it is not part of MVP.

## Included Features

The MVP contains only:

- Authentication
- User Profile
- Credits
- Subscription
- Single Image Mode
- Projects
- Idea Chat
- Characters
- Asset Library
- Comic Studio
- Export

---

## Authentication

### Purpose
Allow users to sign in, sign out, and access their own workspace securely.

### User Flow
1. User opens the app.
2. User signs in.
3. App creates an authenticated session.
4. User is redirected to the main dashboard or last active page.
5. User signs out when finished.

### Main UI
- Sign in page
- Sign out action
- Session status indicator

### Required APIs
- Clerk Sign In route
- Clerk Sign Up route
- Clerk Sign Out route
- `GET /v1/me`

### Database Tables
- Clerk-managed authentication records outside the application database

### Credits Behavior
- Authentication does not consume credits.

### Edge Cases
- Invalid credentials
- Expired session
- Session revoked from another device
- User tries to access a protected route while signed out

### Acceptance Criteria
- A user can sign in successfully.
- A user can sign out successfully.
- Protected pages require authentication.
- The current authenticated user can be retrieved reliably.
- Authentication failure states are shown clearly.

---

## User Profile

### Purpose
Allow a user to view and update their personal account information.

### User Flow
1. User opens profile settings.
2. User views current profile data.
3. User edits allowed fields.
4. User saves changes.
5. App confirms the update.

### Main UI
- Profile settings page
- Editable profile form
- Save button

### Required APIs
- `GET /v1/me`
- `PATCH /v1/me`

### Database Tables
- `user_profiles`

### Credits Behavior
- Viewing or editing the profile does not consume credits.

### Edge Cases
- Invalid name format
- Empty required fields
- Concurrent update conflict
- Partial update failure

### Acceptance Criteria
- A user can view their profile.
- A user can update allowed profile fields.
- Validation errors are shown clearly.
- Profile updates persist correctly.

---

## Credits

### Purpose
Track and display the user’s available usage balance for paid AI actions.

### User Flow
1. User views current credit balance.
2. User sees charges before generation.
3. System reserves credits before expensive actions.
4. System commits or refunds credits after execution.
5. User reviews usage history.

### Main UI
- Credit balance display
- Usage estimate display
- Credit history view
- Reservation / charge status indicators

### Required APIs
- `GET /v1/credits/balance`
- `GET /v1/credits/ledger`
- `POST /v1/credits/reservations`
- `POST /v1/credits/reservations/:reservationId/commit`
- `POST /v1/credits/reservations/:reservationId/release`

### Database Tables
- `credit_accounts`
- `credit_ledger_entries`
- `credit_reservations`

### Credits Behavior
- Credits are required for generation features that consume paid compute.
- Reservation happens before generation.
- Successful generation commits the reserved amount.
- Failed generation releases or refunds unused reserved credits.
- Balance must never go negative.

### Edge Cases
- Insufficient balance
- Duplicate reservation request
- Job fails after reservation
- Job costs less than estimate
- Ledger entry conflict

### Acceptance Criteria
- The user can see their balance.
- The system prevents generation when balance is insufficient.
- Credit reservation, commit, and refund flows are auditable.
- The balance remains correct after failures and retries.

---

## Subscription

### Purpose
Allow users to purchase and maintain access to a subscription plan that provides credits.

### User Flow
1. User opens subscription page.
2. User views available plan.
3. User subscribes or renews.
4. System activates entitlement.
5. Plan status and billing state are visible to the user.

### Main UI
- Subscription page
- Plan card
- Current plan status
- Billing status indicator

### Required APIs
- `GET /v1/subscription`
- `GET /v1/subscription/plans`
- `POST /v1/subscription/checkout`
- `POST /v1/subscription/webhook`

### Database Tables
- `plans`
- `subscriptions`
- `subscription_events`

### Credits Behavior
- Subscription can grant recurring credits according to plan rules.
- Credit grants from subscription must be recorded in the ledger.
- Subscription itself does not directly perform generation.

### Edge Cases
- Payment failure
- Renewal failure
- Cancelled subscription
- Duplicate webhook event
- Plan already active

### Acceptance Criteria
- A user can view subscription status.
- A user can start a subscription checkout flow.
- Subscription changes update entitlements correctly.
- Webhook events are handled idempotently.

---

## Single Image Mode

### Purpose
Allow a user to generate a single image from a prompt or reference inputs.

### User Flow
1. User opens Single Image Mode.
2. User chooses a target project.
3. User enters prompt and optional settings.
4. App estimates credit cost.
5. User starts generation.
6. System reserves credits.
7. System generates the image.
8. Result is shown and saved as an asset.
9. User can regenerate or download the image.

### Main UI
- Prompt input
- Target project selector
- Style or quality options
- Generate button
- Progress state
- Generated image preview
- Download and save actions

### Required APIs
- `POST /v1/single-image/jobs`
- `POST /v1/ai/jobs`
- `GET /v1/ai/jobs/:jobId`
- `GET /v1/ai/jobs/:jobId/events`
- `POST /v1/assets`
- `GET /v1/assets/:assetId`

### Database Tables
- `ai_jobs`
- `ai_job_steps`
- `assets`
- `asset_variants`
- `credit_reservations`
- `credit_ledger_entries`

### Credits Behavior
- Generation consumes credits.
- Cost must be shown before generation starts.
- Credits are reserved before the AI job begins.
- If generation succeeds, credits are committed.
- If generation fails, unused credits are released or refunded.

Milestone 7 establishes the provider-agnostic AI job and credit lifecycle foundation only.
The initial infrastructure estimate is 5 credits for text-generation jobs and 20 credits for image-generation jobs.
Milestone 8 adds Single Image Mode using the provider-agnostic AI job foundation, the placeholder provider adapter, and a deterministic placeholder image artifact saved through the Asset Library.
Real provider image generation remains excluded until explicitly approved.

### Edge Cases
- Invalid prompt
- Insufficient credits
- Model timeout
- Provider error
- Partial output failure
- User refreshes while job is running

### Acceptance Criteria
- A user can generate a single image.
- Credit cost is shown before execution.
- The generated image is stored as an asset.
- Failure states are visible and recoverable.

---

## Projects

### Purpose
Provide a container for organizing a comic creation effort, including images, characters, chats, and exports.

### User Flow
1. User creates a project.
2. User names the project and optionally adds metadata.
3. User opens the project workspace.
4. User navigates to related project tools.
5. User updates or archives the project.

### Main UI
- Project list
- Create project form
- Project detail page
- Project metadata panel

MVP project metadata is limited to:
- `name`
- `description`

### Required APIs
- `GET /v1/projects`
- `POST /v1/projects`
- `GET /v1/projects/:projectId`
- `PATCH /v1/projects/:projectId`

### Database Tables
- `projects`
- `project_settings`
- `project_versions`

### Credits Behavior
- Creating or viewing a project does not consume credits.

### Edge Cases
- Duplicate project name
- Empty required title
- Unauthorized access to another user’s project
- Archived project opened by mistake
- Unknown metadata fields submitted to the project update API

### Acceptance Criteria
- A user can create a project.
- A user can view their projects.
- A user can update project metadata.
- Project access is isolated to the correct user or workspace.

---

## Idea Chat

### Purpose
Let the user brainstorm story ideas, scene concepts, and prompt direction for the current project.

### User Flow
1. User opens Idea Chat inside a project.
2. User types a question or idea request.
3. System generates a response using stored context.
4. Conversation history is preserved.
5. User can continue the discussion or copy useful output into project assets.

### Main UI
- Chat thread view
- Message composer
- Send button
- Conversation history

### Required APIs
- `GET /v1/projects/:projectId/idea-threads`
- `POST /v1/projects/:projectId/idea-threads`
- `GET /v1/idea-threads/:threadId`
- `POST /v1/idea-threads/:threadId/messages`

### Database Tables
- `idea_threads`
- `idea_messages`
- `idea_context_snapshots`

### Credits Behavior
- If the chat uses an AI model, it consumes credits.
- Cost should be estimated before sending a paid prompt.
- Failed generations should not charge the user for unsuccessful execution.

### Edge Cases
- Empty message
- Context too large
- AI response timeout
- Thread not found
- History loading failure

### Acceptance Criteria
- A user can create and continue an idea chat thread.
- Message history persists.
- Responses are linked to the correct project.
- Credit usage is consistent and visible when applicable.

---

## Characters

### Purpose
Let the user define and manage the people, creatures, or entities that appear in the comic.

### User Flow
1. User opens Characters in a project.
2. User creates a character.
3. User fills in character details.
4. User saves the character.
5. User can edit or delete the character later.

### Main UI
- Character list
- Character create/edit form
- Character detail view
- Character reference area

### Required APIs
- `GET /v1/projects/:projectId/characters`
- `POST /v1/projects/:projectId/characters`
- `GET /v1/characters/:characterId`
- `PATCH /v1/characters/:characterId`
- `DELETE /v1/characters/:characterId`

### Database Tables
- `characters`
- `character_versions`
- `character_assets`

### Credits Behavior
- Creating or editing character metadata does not consume credits.
- If a character reference image is generated later, that generation consumes credits.

### Edge Cases
- Missing required name
- Duplicate character name in the same project
- Deleting a character that is referenced elsewhere
- Editing a character while another edit is in progress

### Acceptance Criteria
- A user can create, edit, view, and delete characters.
- Character data is scoped to a project.
- Character changes persist correctly.

---

## Asset Library

### Purpose
Store and manage images and related files used by the project.

### User Flow
1. User uploads or saves an asset.
2. Asset is stored and indexed.
3. User views the library.
4. User selects, tags, downloads, or reuses an asset.

### Main UI
- Asset grid or list
- Upload button
- Asset detail panel
- Tags and metadata panel

### Required APIs
- `POST /v1/assets/upload-url`
- `POST /v1/assets`
- `GET /v1/projects/:projectId/assets`
- `GET /v1/assets/:assetId`
- `PATCH /v1/assets/:assetId`
- `DELETE /v1/assets/:assetId`

### Database Tables
- `assets`
- `asset_variants`
- `tags`
- `asset_tags`

Asset records persist only `storage_provider` and `storage_key`.
Public URLs must be resolved through the Storage module.
Tags are normalized through `tags` and linked through `asset_tags`.
Asset-specific properties use flexible metadata storage where appropriate.
Asset status is explicit with initial states for uploading, ready, failed, archived, and deleted.

### Credits Behavior
- Uploading a user file does not consume credits.
- Storing AI-generated assets is tied to the generation cost already paid.
- Transforming or regenerating assets may consume credits.

### Edge Cases
- Upload failure
- Unsupported file type
- File too large
- Asset metadata missing
- Asset referenced by a project scene or export

### Acceptance Criteria
- A user can upload and view assets.
- Assets are associated with the correct project.
- Assets can be reused in other MVP features.

---

## Comic Studio

### Purpose
Allow the user to compose comic pages using panels, bubbles, and imported or generated assets.

### User Flow
1. User opens Comic Studio within a project.
2. User creates or opens a page.
3. User arranges panels and content.
4. User edits text bubbles and layout.
5. User saves the page.

### Main UI
- Page canvas
- Panel layout editor
- Bubble editor
- Tool palette
- Page navigator

### Required APIs
- `GET /v1/projects/:projectId/comic-studio`
- `GET /v1/projects/:projectId/comic-pages`
- `POST /v1/projects/:projectId/comic-pages`
- `GET /v1/comic-pages/:pageId`
- `PATCH /v1/comic-pages/:pageId`
- `PATCH /v1/comic-panels/:panelId`
- `PATCH /v1/comic-bubbles/:bubbleId`

### Database Tables
- `comic_pages`
- `comic_panels`
- `comic_bubbles`
- `comic_layout_versions`

### Credits Behavior
- Editing layout and text does not consume credits.
- If Comic Studio triggers generation of a new image or asset, that generation consumes credits.

### Edge Cases
- Unsaved changes
- Invalid panel layout
- Bubble text overflow
- Concurrent edits
- Missing asset referenced by a panel

### Acceptance Criteria
- A user can create and edit comic pages.
- Panels and bubbles persist correctly.
- The page can be reopened and edited later.

---

## Export

### Purpose
Allow the user to export their comic or project content into a downloadable format.

### User Flow
1. User chooses export from a project.
2. User selects export settings if available.
3. System generates the export file.
4. User downloads the result.
5. Export history is preserved.

### Main UI
- Export action
- Export settings panel
- Export progress state
- Download link or button
- Export history list

### Required APIs
- `POST /v1/exports`
- `GET /v1/exports/:exportId`
- `GET /v1/exports/:exportId/download`

### Database Tables
- `export_jobs`
- `export_artifacts`

### Credits Behavior
- Export may or may not consume credits depending on the final export policy.
- If export processing uses paid compute, that cost must be shown before execution.
- Export credit usage, if any, must be recorded in the ledger.

### Edge Cases
- Export job failure
- Download expired
- Missing source page or asset
- Partial export generation
- User closes page during export

### Acceptance Criteria
- A user can start an export job.
- The export can be downloaded successfully.
- Export status is visible while processing.
- Export history is preserved.

---

## Out of Scope

The following features are not part of Version 1.0:

- Marketplace
- Collaboration
- Studio Mode
- Reading Platform
- Admin
- Analytics
- Enterprise features
- Multi-Agent
- AI Video
- Voice Generation
- Translation
- Motion Comic
- Team Collaboration
