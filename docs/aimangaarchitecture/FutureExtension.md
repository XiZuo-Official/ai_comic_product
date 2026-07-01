# Future Extension

## Purpose
This document describes how the platform may expand in the future without violating MVP scope or architectural stability.

## Approved Extension Model

Future capabilities must be added using one of these models:

1. A new independent module
2. A plugin that depends only on public contracts
3. A separate service with a stable integration boundary

## Future Capabilities

These are explicitly roadmap items, not current modules:
- Multi-Agent
- AI Video
- Voice Generation
- Translation
- Motion Comic
- Team Collaboration

## Expansion Rules

- New features must not require rewriting existing MVP modules.
- New features must integrate through public interfaces only.
- Existing user workflows must continue to operate unchanged.
- Backward compatibility must remain the default assumption.

## AI Expansion Rules

The AI layer should support new capabilities by adding adapters and workflows rather than changing domain logic.

Examples:
- add a new provider adapter for a new model
- add a new workflow for video generation
- add a new plugin for translation

The rest of the system should continue to call the same AI abstraction layer.

## Plugin Model

Plugins should have:
- a stable manifest
- an isolated implementation
- explicit inputs and outputs
- a documented dependency surface
- no access to internal module state

## Recommended Future Plugin Candidates

### Multi-Agent
Use case:
- orchestrating multiple AI agents for planning or critique

### AI Video
Use case:
- generating motion from scenes or panels

### Voice Generation
Use case:
- generating narration or character voice assets

### Translation
Use case:
- localizing dialogue and captions

### Motion Comic
Use case:
- animating still comic panels into lightweight motion content

### Team Collaboration
Use case:
- shared editing, approvals, and role-based coordination

## Safe Extension Strategy

The safest order of expansion is:
1. define the public contract
2. implement the new module or plugin
3. connect it through the existing orchestration layer
4. preserve old flows
5. add compatibility tests

## Non-Goals for Now

Do not introduce:
- marketplace mechanics
- admin dashboards
- analytics platform features
- enterprise-specific flows
- reading platform functionality

These must remain out of the MVP codebase until explicitly approved.
