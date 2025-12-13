# Feature Spec: Exercise Library

## Summary
Users can browse, search, filter, and open exercise details. Mobile fetches data from the API.

## Data Source
- Mobile retrieves exercises from the API over HTTP.
- DTO schemas/types are defined in `packages/shared`:
  - API may import runtime schemas for validation.
  - Mobile must import types only.

## Milestone 02 requirement: Protocol on ExerciseDetail
To support the logged-out “Execute Exercise Session” journey:
- `ExerciseDetail` must include `protocol`:
  - `protocol.kind` in `{ "timed_reps_sets", "weights_reps_sets" }`
  - `protocol.default` containing default config values for that kind

(See `docs/features/execute-exercise-session/spec.md`.)

## Acceptance Criteria
- [ ] Users can view a list of exercises (infinite scroll).
- [ ] Users can filter exercises by **category**, **difficulty**, and **equipment** using a modal with radio buttons.
- [ ] Users can search exercises by name or summary.
- [ ] Users can paginate through the list using cursor-based pagination.
- [ ] Users can view details of a specific exercise.
- [ ] Exercise details include images, instructions (markdown), and metadata.
- [ ] UI includes loading, empty, and error states.

## Endpoints

### GET /v1/exercises
- **Query Params**
  - `q`: search term (string, optional) — matches name or summary
  - `category`: filter (enum, optional)
  - `difficulty`: filter (enum, optional)
  - `equipment`: filter (enum, optional)
  - `limit`: items per page (default 20)
  - `cursor`: base64 encoded cursor
- **Response**
  - `{ items: ExerciseSummary[], nextCursor?: string }`
- **Notes**
  - Filters are combined using AND semantics (when multiple provided).
  - Sort order must be stable and cursor-compatible (e.g., `updatedAt desc, id desc`).
  - Enum values should be defined in `@climbr/shared` (constants/types).

### GET /v1/exercises/:id
- **Params**
  - `id`: UUID or slug
- **Response**
  - `ExerciseDetail` (must include `protocol`; see Milestone 02 requirement above)
- **Errors**
  - 404 if not found.