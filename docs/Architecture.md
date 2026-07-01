# Architecture

## Purpose
This document is the source of truth for the product architecture. The system is designed to prioritize:

- MVP-first delivery
- strict module isolation
- long-term stability
- backward compatibility
- provider-agnostic AI
- plugin-style expansion
- domain-driven design
- documentation-first development
- architectural approval before redesign

The architecture must support continuous evolution without forcing rewrites of implemented modules.

## Product Scope

### In Scope for MVP
- Single Image Mode
- Project Mode
- Idea Chat
- Characters
- Asset Library
- Comic Studio
- Credits
- Subscription
- Export

### Out of Scope for MVP
These are roadmap items only and must not be implemented as core product modules:
- Marketplace
- Collaboration
- Studio Mode
- Reading Platform
- Admin
- Analytics
- Enterprise features

### Future Extension Areas
These capabilities may be introduced later only as plugins or new modules:
- Multi-Agent
- AI Video
- Voice Generation
- Translation
- Motion Comic
- Team Collaboration

## Core Architectural Principles

### 1. MVP First
Only build the current product scope. Every non-MVP capability should be represented as an extension point, not a dependency.

### 2. Strict Module Isolation
Each module must be independently developed, tested, and evolved.
- A new feature should be added as a new module whenever possible.
- Modules may not import another module’s internal files.
- Modules communicate only through public interfaces.

### 3. Stable Architecture
Once a module is implemented and validated:
- avoid structural changes unless fixing a bug
- prefer additive changes
- preserve module contracts

### 4. Backward Compatibility
- Existing APIs must remain backward compatible whenever possible.
- Database migrations must be additive-first and non-destructive.
- Existing user data must never be destroyed by default migrations.

### 5. AI Provider Independence
The AI layer must be abstracted behind provider interfaces so providers can be replaced without affecting the rest of the app.

### 6. Plugin-Style Expansion
Future capabilities must be delivered as plugins or independent modules with explicit contracts.

### 7. Domain-Driven Design
Each business domain owns its own rules, data, and invariants.

### 8. Open for Extension, Closed for Modification
The system must follow the Open/Closed Principle.

- Prefer extending the system rather than modifying stable modules.
- Add new functionality through new modules, services, adapters, plugins, strategies, or event handlers.
- Working modules should remain stable once implemented and tested.
- If a new feature appears to require widespread modification of existing modules, treat that as an architecture problem and redesign the boundary before implementation.
- Every pull request should minimize changes to existing files and favor additive extension points.

### 9. Documentation-First Development
The `/docs` directory is the single source of truth for the project.

- Read the documentation before implementing any feature.
- Never make architectural assumptions when documentation exists.
- If documentation conflicts with code, stop and ask for clarification instead of guessing.
- Any change to architecture, APIs, database schema, or business rules must be documented in the same pull request.
- Documentation and implementation must stay synchronized.

### 10. Architectural Approval Required
Codex must not redesign the architecture on its own.

If a requested feature appears to require:
- changing existing architecture
- modifying module boundaries
- changing database relationships
- introducing new core dependencies
- changing business rules
- breaking backward compatibility

do not implement it immediately.

Instead:
1. Explain why the current architecture is insufficient.
2. Propose one or more architectural options.
3. Describe the trade-offs.
4. Wait for explicit approval before making architectural changes.

Major architectural decisions always require human approval.

## System Shape

The product should begin as a modular monolith with strong boundaries.

Why this is the right starting point:
- simplest deployment model
- easiest to keep backward compatible
- least operational overhead
- still supports clean future extraction

The monolith must not become a shared-code free-for-all. Each module should feel like a service boundary even if it lives in one repository.

## Primary Domains

### Projects
Owns project lifecycle, metadata, structure, and persistence.

### Characters
Owns character definitions, profiles, and references.

### Assets
Owns uploads, transformations, storage metadata, and retrieval.

### Idea Chat
Owns conversational ideation flows and prompt history.

### Comic Studio
Owns panel/page composition, editing, and scene assembly.

### Credits
Owns billing logic, consumption rules, reservation, and refunds.

### Subscription
Owns plans, entitlement logic, and subscription lifecycle.

### Export
Owns rendering and packaging outputs for download or delivery.

### AI Orchestration
Owns provider abstraction, prompt execution, job orchestration, and normalization.

## Module Communication Rules

- Modules do not call each other’s repositories or database tables directly.
- Modules do not reach into another module’s internal utilities.
- Modules exchange data through public services, commands, queries, or events.
- Shared types must be published through a stable contract layer only.

## Change Policy

- Extend via new code paths whenever possible.
- Modify existing code only when needed to fix a bug, preserve compatibility, or harden a stable contract.
- If a change would ripple across many modules, stop and redesign the extension point first.

## Compatibility Rules

### API Compatibility
- Prefer additive API changes.
- Never rename or remove fields without a versioning strategy.
- Deprecation must be gradual and documented.

### Data Compatibility
- Prefer soft deletion or archival over hard deletion.
- Schema changes must preserve existing records.
- Data migrations must be reversible when practical.

### Behavior Compatibility
- New features must default off unless explicitly enabled.
- Existing workflows must continue to work after upgrades.

## Implementation Style

### Additive Evolution
When extending the system, prefer:
- new modules over modifying unrelated modules
- new API endpoints over changing old request shapes
- new schema columns over destructive rewrites
- new adapters over provider-specific code paths

### Versioned Contracts
Public contracts should be versioned at the boundary:
- API versions
- prompt templates
- AI provider adapters
- export formats where needed

## AI Architecture Summary

AI must be treated as an orchestration layer, not a business domain owner.

Required traits:
- provider-agnostic
- deterministic where possible
- observable
- resumable
- safe to retry
- cost-aware

## Scalability Strategy

The system should scale in layers:
1. Modular monolith
2. Queue-based async processing
3. Selective service extraction
4. Plugin-based expansion for new capabilities

The default strategy is to extend existing contracts, not rewrite implementations.
