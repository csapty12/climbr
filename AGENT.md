# Agent Guidance (Root)

This repo is built using spec-driven development and AI-assisted coding.

**Entry Point:** [Documentation Index](docs/DOCS_INDEX.md)

## Key Locations
- **Architecture Rules**:
  - [Mobile](apps/mobile/AGENT.md)
  - [API](apps/api/AGENT.md)
  - [Shared](packages/shared/AGENT.md)
- **Feature Specs**: `docs/features/*/spec.md`
- **Milestones**: `docs/milestones/*/README.md`

## Workflow
1. Read the **Milestone** doc to understand the current bundle of work.
2. Read the referenced **Feature Spec** for detailed acceptance criteria.
3. Consult **Architecture Rules** before modifying code.
4. Implement minimal changes, verify, and update status.

## Doc Precedence (highest → lowest)
1. Root `AGENT.md` (this file)
2. `apps/*/AGENT.md` and `packages/shared/AGENT.md`
3. `docs/features/<feature>/spec.md`
4. `docs/milestones/<milestone>/README.md` (bundle + high-level scope; feature specs are source of truth for requirements)

## Quality Bar
- New business logic must be unit tested (e.g., timer engine / segment builder).
- Keep domain logic out of screens; put it in testable modules.
- Prefer small, composable modules; avoid duplication (DRY).
- Avoid premature abstraction; introduce interfaces only when there are ≥2 implementations or a clear seam needed for testing.
- Update docs/specs if behaviour changes.

## Non-Negotiables
- **Mobile app never talks to DB directly.** (Mobile -> API -> DB)
- **No side effects in Shared package.**
- **Strict TypeScript.**