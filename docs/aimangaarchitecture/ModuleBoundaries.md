# Module Boundaries

## Boundary Philosophy

Every domain is a module with a clear owner, public interface, and internal implementation.
Modules are independent and should be extendable without editing each other’s internals.

## Mandatory Rules

- Each module owns its business logic.
- Each module owns its invariants.
- Each module owns its persistence access patterns.
- Other modules may only interact through the owning module’s public API.
- New capabilities should generally be new modules or plugins.

## MVP Modules

### Projects
Owns:
- project creation
- project metadata
- project lifecycle
- project settings

Does not own:
- character rules
- asset storage internals
- credit accounting

### Idea Chat
Owns:
- conversation state
- prompt context
- idea generation history

Does not own:
- project persistence
- AI provider details

### Characters
Owns:
- character records
- character versions
- character references

Does not own:
- page layout
- export formatting

### Assets
Owns:
- upload lifecycle
- file metadata
- asset variants
- tags and references

Does not own:
- project logic
- billing logic

### Comic Studio
Owns:
- page structure
- panel composition
- bubble placement
- editing workflows

Does not own:
- asset storage implementation
- provider selection

### Credits
Owns:
- credit balances
- reserves
- commits
- refunds
- accounting history

Does not own:
- subscription plan definitions
- AI provider orchestration

### Subscription
Owns:
- plans
- entitlements
- subscription lifecycle

Does not own:
- credit ledger internals

### Export
Owns:
- export job management
- packaging
- artifact metadata

Does not own:
- original content ownership

### AI Orchestration
Owns:
- provider abstraction
- prompt execution
- job routing
- result normalization

Does not own:
- domain data rules
- billing policy
- user-facing content rules

## Public Interface Patterns

Modules may expose:
- commands for state-changing actions
- queries for read access
- events for asynchronous notification
- DTOs or contracts for integration

Modules may not expose:
- private repositories
- internal database models
- unversioned helpers that become de facto public APIs

## Dependency Rules

Preferred dependency directions:
- UI depends on public module APIs
- API depends on application-layer module interfaces
- application layer depends on domain rules
- infrastructure depends inward only

Forbidden dependency patterns:
- module A importing module B internals
- direct table access across modules
- shared global state between domains
- cyclic module dependencies

## Extension Policy

Future features should be introduced as new modules when they represent a new domain.

Examples:
- Multi-Agent becomes a new module
- Voice Generation becomes a new module
- Translation becomes a new module
- Motion Comic becomes a new module
- Team Collaboration becomes a new module

Existing modules should not be rewritten to accommodate these features unless a stable public extension point already exists.

## Stability Policy

When a module is released and tested:
- avoid changing internal structure
- preserve public contracts
- extend through adapters or new modules
- keep migrations additive

## Compatibility Policy

If a module must evolve:
- add new methods instead of changing old behavior
- add new fields instead of renaming old ones
- deprecate gradually
- keep old paths working until migration is complete
