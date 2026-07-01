# Coding Standards

## Goals

These standards exist to protect maintainability, extensibility, and backward compatibility.

## General Standards

- Prefer clarity over cleverness.
- Prefer explicit domain names over generic abstractions.
- Keep functions small and purpose-specific.
- Avoid deep dependency chains.
- Avoid premature optimization.

## Module Rules

- A module owns its logic, validation, and invariants.
- Modules expose public interfaces only.
- Do not import another module’s internal files.
- Do not move shared business logic into a generic utility package unless it is truly cross-domain.

## Naming Conventions

- Use domain language in file, function, and type names.
- Avoid names like `manager`, `helper`, or `common` unless narrowly justified.
- Prefer nouns for domain objects and verbs for use cases.

## API Standards

- Treat request and response schemas as contracts.
- Additive changes are preferred.
- Breaking changes require versioning and migration planning.

## Database Standards

- Migrations must be safe and non-destructive.
- Add nullable fields before enforcing required constraints.
- Never drop production data casually.
- Store historical snapshots where reversibility matters.

## AI Standards

- All provider calls go through provider interfaces.
- Prompt templates must be versioned.
- Store prompt inputs and outputs for traceability.
- Do not couple domain logic directly to any one model vendor.

## Credit Standards

- Credit accounting must be append-only.
- Reservation and commit must be separate steps.
- Refunds must be explicit and traceable.
- Never infer billing state from UI state.

## Testing Standards

- Every module should have its own unit tests.
- Public interfaces should have contract tests.
- Async workflows should have integration tests.
- Backward compatibility should be tested before releasing breaking changes.

## Refactoring Standards

Refactor only when necessary and prefer:
- additive extension
- adapter introduction
- contract expansion
- wrapper layers

Avoid rewriting stable modules unless correcting a bug or vulnerability.

## Open/Closed Standards

- New behavior should be introduced through extension points, not by editing the core of stable modules.
- Prefer new feature modules over expanding existing modules.
- Prefer new adapters or strategies over branching logic inside established services.
- Prefer events and handlers over direct cross-domain coupling.
- If a feature needs broad edits across unrelated modules, pause and redesign the architecture before coding.

## Documentation Standards

- Docs are source of truth.
- Code must follow docs, not the other way around.
- Update docs before changing architecture.
- Keep docs narrow, explicit, and versioned where useful.

## Documentation-Driven Development

- Always read the docs before implementing a feature.
- Treat `/docs` as authoritative over comments, issues, or prior assumptions.
- If implementation and docs conflict, stop and ask for clarification.
- If code changes architecture, APIs, schema, or business rules, update the corresponding docs in the same pull request.
