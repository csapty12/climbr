# Repo Guardrails (Expanded)

This document expands on the repo rules referenced by the root `AGENT.md`.

If anything here conflicts with another doc, follow this precedence:
1. Root `AGENT.md`
2. `apps/*/AGENT.md` and `packages/shared/AGENT.md`
3. This file (`docs/agents/GUARDRAILS.md`)
4. Feature specs (`docs/features/*/spec.md`) and milestone docs (`docs/milestones/*`)

---

## Core Principles

### Separation of Concerns
- `apps/mobile` (Expo) must NEVER access the database directly. It must go through the API.
- `apps/api` (Fastify) owns all persistence and business logic.
- `packages/shared` owns cross-repo DTO schemas and the inferred TypeScript types.

### Single Source of Truth
- API request/response DTOs must be defined in `packages/shared`.
- Do not duplicate DTO shapes separately in API and mobile.

### Quality Bar
- Prefer small, composable modules; avoid duplication (DRY).
- Prefer SOLID principles, KISS, YAGNI, etc. as required. 
- Follow appropriate design patterns to ensure code quality and maintainability.
- Keep domain logic out of screens/components; put it in testable modules.
- New or changed business logic must have unit tests where practical.
- Keep changes minimal and spec-driven; avoid scope creep.

---

## Mobile Rules (`apps/mobile`)

### Data Access
- Mobile talks only to the API over HTTP (e.g., Fetch wrapper).
- No direct DB access, and no API logic embedded in UI components.

### Shared Imports
- **Type-only imports from shared**

```ts
import type { ExerciseSummary } from "@climbr/shared";
```

- **No runtime schema imports**
  - Do not import Zod or schema objects into mobile runtime code (bundling issues).
  - If you need runtime validation on mobile, define mobile-safe validators locally (but prefer server validation).

### State & Architecture
- Prefer loosely-coupled code:
  - UI depends on interfaces (e.g., repositories/services), not concrete implementations.
- Keep side effects (networking/storage) behind small adapters.

### Testing
- Unit test pure logic (e.g., timers, segment builders, formatters).
- Keep UI tests lightweight unless explicitly required.
- For any business logic, always unit test it.

---

## API Rules (`apps/api`)

### Validation
- Use specific Zod schemas for all inputs:
  - headers, params, query, body
- Validate at the boundary (route layer) before business logic.

### Error Handling
- Maintain consistent error shape:

```json
{ "code": "ERROR_CODE", "message": "Human readable message", "details": {} }
```

- Never leak internal stack traces to clients.

### Business Logic & Persistence
- Business logic lives in services; routes should be thin.
- Persistence is owned by the API and handled via Prisma (or existing DB layer).

### Testing
- Unit test business logic and pure functions.
- Add integration tests for routes when changing API behaviour.

---

## Shared Rules (`packages/shared`)

### Purpose
- Define DTO schemas/types and shared pure utilities used across API and mobile.

### No Side Effects
- No IO (filesystem/network), no environment-specific code, no Node-only runtime dependencies.
- Keep exports deterministic and safe to import as types.

### DTO Discipline
- Prefer Zod schemas in shared for API validation + inferred TS types.
- Mobile should import types only; API can import runtime schemas.

---

## Conventions

### Documentation
- Feature requirements live in `docs/features/<slug>/spec.md`.
- Milestones bundle features in `docs/milestones/<NN>-<slug>/README.md`.
- Keep architecture/constraints in `apps/*/AGENT.md`.

### Code Style
- TypeScript strict mode; avoid `any`.
- Prefer explicit naming, clear boundaries, and predictable folder structure.
