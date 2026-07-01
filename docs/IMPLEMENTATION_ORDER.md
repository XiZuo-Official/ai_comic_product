# Implementation Order

## Purpose

This document defines the exact order for implementing every Version 1.0 MVP task.
The sequence is optimized for minimal dependencies, low regression risk, and minimal architectural change.

## Rules

- Implement tasks in this order unless explicitly approved otherwise.
- Do not schedule AI generation before the project foundation is complete.
- Do not implement a task before its listed dependencies are complete.
- Prefer additive pull requests with narrow file changes.
- If a task requires unexpected architecture changes, stop and request approval before implementation.
- Each task should remain small enough to become a single pull request.

## Implementation Sequence

| Order | Task ID | Task | Reason For Position |
|---|---|---|---|
| Task 001 | M1-T01 | Configure Monorepo Scripts | Establishes root workflow before app or package code exists. |
| Task 002 | M1-T02 | Create Web App Shell | Creates the deployable frontend surface after root scripts exist. |
| Task 003 | M1-T03 | Create API App Shell | Creates the deployable backend surface after root scripts exist. |
| Task 004 | M1-T04 | Add Environment Configuration | Connects shared runtime configuration after both app shells exist. |
| Task 005 | M1-T05 | Add Health Check | Confirms API deployability and baseline operational status. |
| Task 006 | M2-T01 | Define Auth Domain Contracts | Starts authentication with stable public interfaces. |
| Task 007 | M2-T02 | Add Profile Persistence | Adds app-owned profile storage only after contracts are defined. |
| Task 008 | M2-T03 | Implement Current User/Profile Actions | Exposes current user/profile behavior after persistence exists. |
| Task 009 | M2-T04 | Add Protected Route Flow | Confirms Clerk route protection after auth/profile contracts exist. |
| Task 010 | M2-T05 | Implement User Profile | Builds profile on top of authenticated user identity. |
| Task 011 | M3-T01 | Define Credits Domain Contracts | Establishes credit interfaces before paid features exist. |
| Task 012 | M3-T02 | Add Credits Persistence | Adds credit storage after contracts are stable. |
| Task 013 | M3-T03 | Implement Reservation Lifecycle | Implements core credit accounting before APIs or AI use it. |
| Task 014 | M3-T04 | Implement Credits APIs | Exposes credit behavior after domain rules are tested. |
| Task 015 | M3-T05 | Add Credits UI | Adds user visibility after APIs are stable. |
| Task 016 | M4-T01 | Define Subscription Contracts | Establishes subscription interfaces after credits are defined. |
| Task 017 | M4-T02 | Add Subscription Persistence | Adds subscription storage after contracts exist. |
| Task 018 | M4-T03 | Implement Plan and Subscription APIs | Exposes plan and subscription state before webhook behavior. |
| Task 019 | M4-T04 | Implement Webhook Credit Grant Flow | Connects subscription events to the credits public interface. |
| Task 020 | M4-T05 | Add Subscription UI | Adds user-facing subscription state after APIs are stable. |
| Task 021 | M5-T01 | Define Project Contracts | Establishes project interfaces before project data or UI. |
| Task 022 | M5-T02 | Add Project Persistence | Adds project storage after contracts exist. |
| Task 023 | M5-T03 | Implement Project APIs | Exposes project behavior before project UI. |
| Task 024 | M5-T04 | Add Project List UI | Adds project creation and discovery after APIs are available. |
| Task 025 | M5-T05 | Add Project Detail UI | Adds project metadata editing after project detail API exists. |
| Task 026 | M6-T01 | Define Asset Contracts | Establishes asset and storage interfaces after projects exist. |
| Task 027 | M6-T02 | Add Asset Persistence | Adds asset storage records after contracts exist. |
| Task 028 | M6-T03 | Implement Storage Adapter | Adds storage abstraction before upload APIs depend on it. |
| Task 029 | M6-T04 | Implement Asset APIs | Exposes asset behavior after persistence and storage adapter exist. |
| Task 030 | M6-T05 | Add Asset Library UI | Adds user-facing asset management after APIs are stable. |
| Task 031 | M7-T01 | Define AI Provider Contracts | Starts AI only after foundation, credits, projects, and assets exist. |
| Task 032 | M7-T02 | Add AI Job Persistence | Adds AI job storage after provider-agnostic contracts exist. |
| Task 033 | M7-T03 | Implement AI Job Lifecycle | Adds job state behavior before credit integration or feature workflows. |
| Task 034 | M7-T04 | Integrate Credits with AI Jobs | Connects paid AI jobs to the credits public interface. |
| Task 035 | M7-T05 | Implement AI Job APIs | Exposes generic AI job APIs after lifecycle and credit rules exist. |
| Task 036 | M8-T01 | Define Single Image Workflow | Defines image generation workflow after generic AI jobs exist. |
| Task 037 | M8-T02 | Implement Single Image API | Adds feature-specific API after workflow definition. |
| Task 038 | M8-T03 | Add Single Image Page Form | Adds prompt and estimate UI after API behavior exists. |
| Task 039 | M8-T04 | Add Generation Progress and Result UI | Adds progress and result states after the form flow exists. |
| Task 040 | M8-T05 | Add Download Flow | Adds download after generated asset handling is complete. |
| Task 041 | M9-T01 | Define Idea Chat Contracts | Defines chat contracts after projects and generic AI exist. |
| Task 042 | M9-T02 | Add Idea Chat Persistence | Adds chat storage after contracts exist. |
| Task 043 | M9-T03 | Implement Idea Chat APIs | Exposes chat behavior after storage and AI job APIs exist. |
| Task 044 | M9-T04 | Add Idea Chat UI | Adds chat interface after APIs are stable. |
| Task 045 | M9-T05 | Add Context and Credit Edge Handling | Hardens chat after the base flow works. |
| Task 046 | M10-T01 | Define Character Contracts | Defines character contracts after projects and assets exist. |
| Task 047 | M10-T02 | Add Character Persistence | Adds character storage after contracts exist. |
| Task 048 | M10-T03 | Implement Character APIs | Exposes character behavior after persistence exists. |
| Task 049 | M10-T04 | Add Character List and Detail UI | Adds character management after APIs are stable. |
| Task 050 | M10-T05 | Add Character Asset Linking UI | Adds reference linking after characters and assets both work. |
| Task 051 | M11-T01 | Define Comic Studio Contracts | Defines studio contracts after projects, assets, and characters exist. |
| Task 052 | M11-T02 | Add Comic Studio Persistence | Adds page, panel, bubble, and layout storage after contracts exist. |
| Task 053 | M11-T03 | Implement Comic Studio APIs | Exposes studio behavior before canvas UI. |
| Task 054 | M11-T04 | Add Page Canvas and Navigator | Adds the studio shell after APIs exist. |
| Task 055 | M11-T05 | Add Panel Editing | Adds panel behavior after the canvas shell is stable. |
| Task 056 | M11-T06 | Add Bubble and Asset Placement | Adds richer page composition after panels and assets work. |
| Task 057 | M12-T01 | Define Export Contracts | Defines export contracts after Comic Studio contracts exist. |
| Task 058 | M12-T02 | Add Export Persistence | Adds export storage after contracts exist. |
| Task 059 | M12-T03 | Implement Export Job APIs | Exposes export behavior after persistence exists. |
| Task 060 | M12-T04 | Implement Export Artifact Generation | Generates artifacts after export APIs and studio data exist. |
| Task 061 | M12-T05 | Add Export UI | Adds export actions after backend export flow works. |
| Task 062 | M13-T01 | Add MVP Smoke Tests | Adds cross-feature smoke tests after all MVP features exist. |
| Task 063 | M13-T02 | Add Credit Regression Tests | Hardens credit behavior after all paid flows exist. |
| Task 064 | M13-T03 | Review Error States | Audits user-facing failures after full MVP behavior exists. |
| Task 065 | M13-T04 | Sync Documentation | Updates docs after implementation behavior is known and tested. |
| Task 066 | M13-T05 | Prepare Release Candidate | Final release step after tests, docs, and hardening are complete. |

## Dependency Gates

### Foundation Gate
Tasks 001-005 are expanded by the approved Milestone 1A decision.
Milestone 1A may include Clerk authentication entry points, project CRUD, project layout placeholders, fake credit display, and subscription placeholder before the original later milestone ordering.
AI, model providers, credits backend logic, and payment integration remain gated until their original milestones.

### Auth Gate
Tasks 006-010 must be complete before user-owned data modules depend on authenticated identity.
Clerk owns authentication/session lifecycle for Version 1.0; the app owns only profile persistence and public auth/profile contracts.

### Credits Gate
Tasks 011-015 must be complete before paid AI or subscription credit flows are implemented.

### Project Gate
Tasks 021-025 must be complete before project-scoped modules are implemented.

### Asset Gate
Tasks 026-030 must be complete before AI image output, character references, or Comic Studio asset placement are implemented.

### AI Gate
Tasks 031-035 must be complete before Single Image Mode or Idea Chat generation is implemented.

### Release Gate
Tasks 062-066 must be complete before Version 1.0 can be considered release-ready.

## Notes

- AI generation first appears at Task 036, after the project foundation, authentication, credits, projects, assets, and generic AI job foundation are complete.
- Subscription is scheduled before projects because subscription credit grants depend only on authentication and credits, not project data.
- Projects are scheduled before assets, characters, Idea Chat, Comic Studio, and Export because those modules are project-scoped.
- Export is scheduled after Comic Studio because Version 1.0 export depends on saved comic content.
