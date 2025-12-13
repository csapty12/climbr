# API Architecture

## Stack
- **Framework**: Fastify
- **Language**: TypeScript (strict)
- **Database**: Postgres via Prisma
- **Validation**: Zod
- **Logging**: Pino

## Core Rules
- Routes should be **thin**: validate inputs, call services, shape responses.
- Business logic and persistence live in **services** (and optional repo/data-access modules).
- Keep utilities (pagination, error helpers) in `src/lib`.

## Folder Structure
- `src/server.ts`: Entry point, Fastify setup.
- `src/routes`: Route definitions grouped by version/feature.
- `src/services`: Business logic and DB interaction.
- `src/lib`: Utilities (error handling, pagination).
- `src/db`: Prisma client instance.
- `prisma/`: Schema and migrations.

## Validation
- Use dedicated Zod schemas for **headers**, **params**, **query**, and **body**.
- Validate at the boundary (route layer) before calling services.

## Error Handling
Global error handler returns:
```json
{
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "details": {}
}
```

## Pagination
- Cursor-based pagination using updatedAt and id for stable sorting.
- Cursor format: base64 encoded JSON {"updatedAt": "ISO", "id": "UUID"}.

## Testing Expectations
- Unit test services and src/lib utilities are critical. 
- Add route integration tests when changing API behaviour.

