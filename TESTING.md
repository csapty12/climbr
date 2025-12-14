# Testing Guidance

## Quality expectations
- **UI components** across the mobile app should have focused tests (render, props, interactions) so regressions in the experience are caught early.
- **Business logic** (services, engines, rules) must be covered with unit tests; edge cases, happy paths, and failure paths should all be represented.
- Keep tests fast and deterministic: avoid mocking network/DB at the expense of repeatability—favor isolated modules with injected dependencies.

## Commands
- `pnpm test`: runs the entire workspace test suite (`vitest` per package). This is the canonical “go/no-go” command.
- `pnpm lint`, `pnpm typecheck` are recommended pre-merge sanity checks; run if you’re touching formatting or API contracts.

## Fixtures & Data
- Current fixtures (seeds) live under `apps/api/prisma/seed.ts`; reuse those records when writing API tests to keep expectations consistent.
- Mobile feature tests can rely on shared DTO factories in `packages/shared` when you need consistent sample data.

## Failure signs
- Tests fail when components/services throw unhandled errors; look for stack traces pointing to the module under test.
- Watch for snapshots that change after you modify UI—review diffs to ensure changes are intentional.
