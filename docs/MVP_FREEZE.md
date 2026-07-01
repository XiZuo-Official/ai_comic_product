# MVP Freeze

## Purpose

This document officially freezes Version 1.0 of the product.
It exists to prevent feature creep before the first public release.

Everything listed in this document belongs to Version 1.0.
Everything outside this document belongs to `FutureRoadmap.md` unless explicitly approved.

After this document is created, MVP scope cannot change without explicit approval.

## Freeze Rules

- Version 1.0 may include only the scope listed here.
- New features require explicit approval before entering MVP.
- Future features must remain in `FutureRoadmap.md`.
- Implementation must follow `MVP.md`, `Architecture.md`, `ModuleBoundaries.md`, and this document.
- If implementation work reveals missing scope, stop and request approval before expanding Version 1.0.

## Core Features

Version 1.0 includes only:

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

## Pages

Version 1.0 includes only these application pages or views:

- Sign In
- Sign Up
- Sign Out
- User Profile
- Dashboard / Project List
- Project Detail
- Single Image Mode
- Idea Chat
- Characters
- Asset Library
- Comic Studio
- Credits
- Subscription
- Export

No marketing site, public reading site, marketplace, admin dashboard, analytics dashboard, team workspace, or enterprise console is included in Version 1.0.

## Database Scope

Version 1.0 database scope is limited to tables required by the frozen MVP:

- `users`
- `sessions`
- `auth_identities`
- `user_profiles`
- `projects`
- `project_settings`
- `project_versions`
- `idea_threads`
- `idea_messages`
- `idea_context_snapshots`
- `characters`
- `character_versions`
- `character_assets`
- `assets`
- `asset_variants`
- `asset_tags`
- `comic_pages`
- `comic_panels`
- `comic_bubbles`
- `comic_layout_versions`
- `ai_jobs`
- `ai_job_steps`
- `ai_prompt_templates`
- `ai_provider_calls`
- `credit_accounts`
- `credit_ledger_entries`
- `credit_reservations`
- `credit_refunds`
- `plans`
- `subscriptions`
- `subscription_events`
- `export_jobs`
- `export_artifacts`

Database changes outside this list require explicit approval.

## API Scope

Version 1.0 API scope is limited to endpoints required by frozen MVP features:

- Authentication APIs
- User Profile APIs
- Credits APIs
- Subscription APIs
- Single Image Mode generation APIs
- Project APIs
- Idea Chat APIs
- Character APIs
- Asset Library APIs
- Comic Studio APIs
- Export APIs

No public marketplace API, collaboration API, reading platform API, admin API, analytics API, enterprise API, team API, translation API, video API, voice API, or motion comic API is included.

## AI Scope

Version 1.0 AI scope is limited to:

- Single image generation
- Idea Chat text generation
- AI job tracking
- Provider-agnostic AI adapter interfaces
- Prompt template versioning
- Provider call logging
- Credit estimation for AI actions
- Failure handling and refund/release behavior

Version 1.0 AI scope does not include:

- Multi-agent workflows
- AI video generation
- Voice generation
- Translation
- Motion comic generation
- Automated story agents
- Team review agents
- Marketplace style packs

## Credits Scope

Version 1.0 credits scope is limited to:

- User credit account
- Credit balance display
- Credit ledger
- Credit reservation
- Credit commit
- Credit release or refund
- Subscription credit grants
- Credit checks before paid AI actions
- Preventing negative balances

Credits are consumed only by paid AI actions and any explicitly approved paid export processing.

Version 1.0 credits scope does not include:

- Marketplace revenue sharing
- Team credit pooling
- Enterprise invoicing
- Promotional campaign systems
- Creator monetization
- Usage analytics dashboards

## Export Scope

Version 1.0 export scope is limited to:

- Starting an export job
- Tracking export status
- Generating downloadable export artifacts
- Downloading completed exports
- Preserving export history
- Handling export failure states

Version 1.0 export scope does not include:

- Public publishing
- Reader-facing hosting
- Marketplace distribution
- Team approval workflows
- Print fulfillment
- Video export
- Motion comic export

## Explicitly Not Included

The following are not included in Version 1.0:

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
- Public creator profiles
- Public comic hosting
- Public comic discovery
- Creator monetization
- Revenue sharing
- Asset marketplace
- Style marketplace
- Template marketplace
- Team workspaces
- Role-based team permissions
- Commenting and review workflows
- Real-time co-editing
- Admin moderation tools
- Analytics dashboards
- Enterprise billing
- Enterprise SSO
- White-label deployments
- API access for third-party developers
- Mobile native apps
- Desktop native apps
- Print ordering
- Merchandising

## Approval Requirement

Any request to add, remove, or materially change Version 1.0 scope must be treated as a product and architecture decision.

Before implementation, the change must:

1. Be documented.
2. Explain why the frozen MVP is insufficient.
3. Describe trade-offs.
4. Receive explicit approval.
