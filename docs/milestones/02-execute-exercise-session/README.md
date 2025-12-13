# Milestone 02 — Logged-Out Exercise Journey

## Goal
A logged-out user can:
1. Browse the exercise library
2. Open an exercise detail page
3. Run the exercise using a protocol timer
4. See a completion summary

This milestone ships the complete logged-out “single exercise” journey.

---

## Included Features
- [Exercise Library](../../features/exercise-library/spec.md)
- [Execute Exercise Session (Logged-Out)](../../features/execute-exercise-session/spec.md)
  - Technical design: [Timer Engine](../../features/execute-exercise-session/timer-engine.md)

---

## Out of Scope
- Accounts/auth or cloud sync
- Multi-exercise workouts/templates
- Recording actual reps performed
- Advanced analytics or training plans

---

## Milestone Notes
- Logged-out session logs are stored **locally on-device** (no API persistence).

---

## Milestone Exit Criteria
- Exercise Library feature meets its acceptance criteria (search/filter/pagination/detail)
- Exercise Detail provides protocol data needed by Execute Session (`ExerciseDetail.protocol`)
- Logged-out user can complete both protocol scenarios end-to-end:
  - `timed_reps_sets`
  - `weights_reps_sets`
- Background-safe timer behaviour verified on device
- Summary screen shown at completion/end
- Minimal local persistence for sessions works across app restart
- Unit tests exist for timer segment builder and engine