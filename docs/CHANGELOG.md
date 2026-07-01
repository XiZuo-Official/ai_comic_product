# CHANGELOG

## Purpose
This document records user-visible changes to the architecture and product documentation.

## Versioning Rule
Keep entries short, dated, and additive.

## Template
- Date
- Change
- Why it changed
- Documents updated

## Note
Implementation changes that affect architecture, APIs, schema, or business rules must be accompanied by matching documentation updates.

## 2026-07-01

- Change: Clarified Milestone 2 authentication ownership around Clerk-managed auth and app-owned profile persistence.
- Why it changed: The project already approved Clerk for authentication, and duplicate custom session or identity tables would violate maintainability and stability goals.
- Documents updated: `Decisions.md`, `Database.md`, `API.md`, `MILESTONES.md`, `TASK_BREAKDOWN.md`, `IMPLEMENTATION_ORDER.md`, `MVP.md`, `MVP_FREEZE.md`.

- Change: Added approved Milestone 1A foundation scope and implementation artifacts.
- Why it changed: The first implementation pass was explicitly expanded to include Clerk auth entry points, project CRUD, global layout, project placeholders, fake credit display, and subscription placeholder.
- Documents updated: `Decisions.md`, `MILESTONES.md`, `TASK_BREAKDOWN.md`, `IMPLEMENTATION_ORDER.md`, `MVP_FREEZE.md`, `Database.md`.
