# Stack

## Overview
- **Monorepo** powered by `pnpm` workspaces; run scripts from the root, and each package (API, mobile, shared) pulls from `workspace:*`.
- **Local only for now**—there is no production deployment, just the full stack living on your machine via Docker and Expo.

## Languages & runtimes
- **TypeScript 5.x** end-to-end (API, mobile, shared contracts).
- **Node.js 20+** runtime for the API, tooling, and pnpm scripts.
- **React Native (0.76.9)** + **Expo SDK 52** for the mobile client.

## API stack (`apps/api`)
- **Fastify 4** as the web framework with `@fastify/autoload`, `cors`, `static`, `sensible`, and Zod-backed type providers.
- **Prisma 5.13+** talking to **PostgreSQL** provisioned via `docker compose` (`docker-compose.yml` in repo root).
- **Zod** shared contracts (`@climbr/shared`) for DTO validation and shared schemas.
- Dev tooling: `tsx` for running TypeScript entrypoints, `vitest` for unit tests, ESLint with TypeScript support, `typescript`, and `prisma` CLI.

## Mobile stack (`apps/mobile`)
- **Expo-managed React Native** app (Expo CLI for start/dev/debug).
- **React Navigation 7** (core + stack) plus standard helpers for gestures, safe areas, and screens.
- **Zod** for client-side validation and schema sharing via `@climbr/shared`.
- Dev tooling: Expo CLI, Vitest for tests, ESLint/TypeScript, plus Babel for JS transformation.

## Shared contracts (`packages/shared`)
- Houses DTOs and Zod schemas consumed by both API and mobile.
- Builds via `tsc` and publishes types for the workspace.

## Tooling & utilities
- **Docker Compose** for local PostgreSQL (`pnpm db:up`, `db:down`, `db:reset`).
- **Scripts**: `pnpm dev:api`, `pnpm dev:mobile`, `pnpm db:up/down`, `pnpm prisma:*`, `pnpm test|lint|typecheck`. The root `dev` script wires DB, seed, and API with concurrency.
- **Static assets** served from `apps/api/static`, referenced by URLs under `/static` for exercise media.

## Notes
- Even though we only run locally today, the stack is already split into API + mobile + shared packages to ease future services or deployment targets.
