# Shared Package Architecture

## Purpose
Shared DTOs, types, and pure utilities used by both API and Mobile.

## Guardrails
- **Single Source of Truth**: DTO schemas and inferred API types are defined here.
- **Pure Functions Only**: This package should be pure functions and types.
- **No Side Effects**: No IO, no environment-specific behaviour, no global state.
- **No Node-only deps**: Do not import Node-only modules (fs, path, crypto, etc.).

## Mobile Compatibility
- Mobile should import **types only** from `@climbr/shared`.
- API may import runtime schemas (e.g., Zod) for validation.

## Export Separation (important)
Maintain clear separation between:
- **runtime exports** (schemas/constants) and
- **type exports** (inferred types / interfaces)

Suggested conventions:
- `src/schemas/*.ts` (Zod schemas, runtime — API-side use)
- `src/types/*.ts` (type aliases/interfaces — safe for mobile type-only imports)
- `src/constants.ts` (runtime constants — ensure RN-safe)