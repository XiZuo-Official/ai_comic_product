# Folder Structure

## Repository Strategy
Use a monorepo with explicit app and package boundaries.
The repository should start small but remain ready for future extraction.

## Documentation Strategy

The `/docs` directory is the source of truth for the project.
Do not treat architecture notes in code comments, issues, or ad hoc messages as authoritative over `/docs`.

## Proposed Structure

```text
ai-manga-product/
  apps/
    web/
    api/
  packages/
    auth/
    ai/
    assets/
    billing/
    characters/
    comic-studio/
    credits/
    export/
    ideas/
    projects/
    storage/
    ui/
    types/
    utils/
  docs/
    PRD.md
    Architecture.md
    FolderStructure.md
    Database.md
    API.md
    CodingStandards.md
    ModuleBoundaries.md
    Decisions.md
    FutureRoadmap.md
    RELEASE_CANDIDATE.md
    CHANGELOG.md
  infra/
    migrations/
    docker/
  scripts/
  tests/
```

## Directory Responsibilities

### `apps/web`
User-facing application for MVP workflows:
- Single Image Mode
- Project Mode
- Idea Chat
- Characters
- Asset Library
- Comic Studio
- Credits
- Subscription
- Export

### `apps/api`
HTTP API, authentication integration, request validation, and async job entry points.

### `packages/auth`
Authentication and authorization contracts.

### `packages/ai`
Provider abstraction, prompt orchestration, AI job lifecycle, prompt template versioning, provider call logging, and credit-aware AI execution interfaces.

### `packages/assets`
Asset domain logic, upload lifecycle, metadata contracts, normalized tag assignment, and asset persistence access.

### `packages/billing`
Subscription and plan rules.

### `packages/characters`
Character domain logic.

### `packages/comic-studio`
Comic editing domain logic.

### `packages/credits`
Credit accounting and reservation logic.

### `packages/export`
Export orchestration and artifact contracts.

### `packages/ideas`
Idea chat and context management.

### `packages/projects`
Project lifecycle and project metadata.

### `packages/storage`
Storage public interface, upload target creation, storage-key resolution, and provider adapters.

### `packages/ui`
Reusable UI components only. No domain logic.

### `packages/types`
Shared public contracts only.

### `packages/utils`
Pure helpers that do not contain business rules.

### `tests`
Release-gate smoke tests and repository-level hardening checks.
These tests verify MVP route surfaces, documentation sync, migration ordering, and absence of out-of-scope route groups.

## Boundary Rules

- Each package exposes a narrow public API.
- Internal files inside a package are not imported directly by other packages.
- Shared types should be placed in `packages/types` only when they are truly cross-domain.
- UI packages must not contain business logic.
- Domain packages must not depend on the frontend.

## Future Modules

Future capabilities should appear as new sibling packages, not modifications to unrelated packages:
- `packages/multi-agent`
- `packages/video`
- `packages/voice`
- `packages/translation`
- `packages/motion-comic`
- `packages/collaboration`

## File Organization Within a Module

Each domain package should follow a consistent internal layout:
- `api/` public interfaces
- `domain/` core rules and entities
- `application/` use cases
- `infrastructure/` adapters and persistence
- `tests/` module-level tests

This layout supports clean separation without forcing a specific framework.
