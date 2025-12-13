# Climb Training App (MVP)

Cross-platform climbing training app built with:
- **Mobile:** React Native (Expo) + TypeScript
- **API:** Fastify + TypeScript
- **DB:** Postgres + Prisma
- **Shared contracts:** TypeScript types + Zod schemas in `packages/shared`

## Repo structure

- `apps/`
  - `api/` Fastify API + Prisma + seed + static assets
  - `mobile/` Expo React Native app
- `packages/`
  - `shared/` DTO types + Zod schemas (shared contracts)
- `docs/`
  - `agent.md`
  - `features/`

## Non-negotiables

- The **mobile app never talks to the database directly**.
- The mobile app talks **only to the API** over HTTP.
- Persistence + business logic live in the API.
- Shared DTOs/schemas live in `packages/shared`.

See: `docs/agent.md`

---

## Prerequisites

- Node.js **20+**
- pnpm (recommended)
- Docker (for local Postgres)
- Xcode Simulator (iOS) and/or Android Studio Emulator

---

## Quickstart

### 1) Install dependencies
```bash
pnpm i
```

### 2) Start Postgres (Docker)
```bash
pnpm db:up
```

### 3) Configure env vars
Create `apps/api/.env` from `apps/api/.env.example`:

```bash
cp apps/api/.env.example apps/api/.env
```
(If you also have a root `.env.example`, copy that too.)

### 4) Migrate DB + seed data
```bash
pnpm --filter @climbr/api prisma:migrate
pnpm --filter @climbr/api seed
```

### 5) Run the API
```bash
pnpm dev:api
```
The API should be available at:
`http://localhost:3000`

Try:
- GET `http://localhost:3000/v1/exercises`
- GET `http://localhost:3000/v1/exercises/<slug-or-uuid>`

### 6) Run the mobile app
```bash
pnpm dev:mobile
```

### Mobile API base URL (important)
Expo needs the correct base URL depending on where you run.
Set this in `apps/mobile/.env` (or `app.config.*` depending on setup):

**iOS Simulator:**
```bash
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3000
```

**Android Emulator:**
```bash
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
```

**Physical device on same Wi-Fi:**
```bash
EXPO_PUBLIC_API_BASE_URL=http://<YOUR_LAN_IP>:3000
```
*Tip: ensure the API is bound to `0.0.0.0` if you’re testing on a physical device.*

### Common scripts
From repo root:

- **Start API:** `pnpm dev:api`
- **Start mobile:** `pnpm dev:mobile`
- **Start DB:** `pnpm db:up`
- **Stop DB:** `pnpm db:down`
- **Reset DB:** `pnpm db:reset`
- **Run tests:** `pnpm test`
- **Typecheck:** `pnpm typecheck`
- **Lint:** `pnpm lint`

### Static assets
The API serves static assets under:
`/static`

Exercise media URLs use paths like:
`/static/exercises/<slug>.png`

## Next milestones
- Workout Runner (timers + protocol engine)
- Auth (signup/login)
- Manual plan builder
- AI plan generation + adaptation loop

See `docs/features/` for spec-driven development docs.