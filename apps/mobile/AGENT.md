# Mobile Architecture

## Stack
- **Framework**: Expo (React Native)
- **Language**: TypeScript (strict)
- **Navigation**: React Navigation
- **Networking**: Fetch API (wrapped)

## Core Rules
- Mobile must **only** talk to the backend via HTTP (no DB access).
- Keep **business/domain logic out of screens**. Put it in testable modules.
- Prefer small, composable modules; avoid duplicating logic across screens.

## Shared Package Usage
- **Type-only imports from `@climbr/shared`**
```ts
import type { ExerciseSummary } from "@climbr/shared";
```
- **Do NOT** import runtime Zod schemas or Node-only runtime code into mobile.

## Folder / Feature Structure (convention)
- Prefer `src/features/<feature>/...` for feature code.
- Screens should be thin wrappers over feature modules (services/engines/repos).

## Screens & Navigation (convention)
- Screens live in `src/features/<feature>/screens/` (preferred) or `src/screens/`.
- Route names use `<Feature><Screen>` (e.g., `ExerciseLibrary`, `ExerciseDetail`, `ExecuteSessionRun`).
- Keep screens thin: compose UI from feature modules and shared UI components.
- The canonical list of screens is the React Navigation config

## Testing Expectations
- Pure logic must have unit tests where feasible (e.g., timer engine, segment builder).
- Keep UI tests minimal unless specified by a feature spec.
