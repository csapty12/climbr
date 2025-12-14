# Contributing Guidelines

## Workflow
- Work on `main`, but create topic branches for feature/bug work so `main` stays in a releasable state.
- Prefix feature branches with `feature/` and bug branches with `bug/` (e.g., `feature/workout-planner`, `bug/api-pagination`).
- Push a branch when you want me to make changes; treat my contributions like PRs you’ll review.
- You are welcome to approve and merge your own PRs once you’ve verified the work aligns with your goals.

## Checklist before merging
- Run `pnpm lint` and `pnpm typecheck` if touching contracts or shared code.
- Run `pnpm test` to make sure unit coverage is solid (UI + business logic as detailed in `TESTING.md`).
- Confirm AGENT or feature docs are updated for any behaviour changes.

## Communication
- Mention any manual steps (env files, migrations, seeds) in the feature spec or doc so next time I know what to rerun.
