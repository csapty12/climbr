# Feature Spec: Execute Exercise Session (Logged-Out)

**Scope:** Run a single exercise as a standalone session (NOT workouts).  
**Applies to:** Mobile (logged-out experience)  
**Depends on:** Exercise Library + Exercise Detail (protocol included)

---

## Summary
A logged-out user can open an exercise from the library and **run it** using the exercise’s protocol. The flow is:
**Exercise Detail → Configure → Run → Summary**

Two protocol scenarios are supported:
- **Timed reps + sets:** work/rest timers auto-advance
- **Weights reps + sets:** user taps **Set complete**, rest timer runs between sets

Timer behaviour requirements (segment builder, backgrounding rules, skip/back semantics) are specified in:
- [Timer Engine](timer-engine.md)

---

## Goals
- User can start a session from Exercise Detail
- User can configure protocol values (with validation)
- User can run the session with a reliable timer:
  - **5s countdown** at start
  - Work → Rest transitions are **immediate**
  - **Skip** allowed for **work and rest**
  - **Back** allowed for both scenarios
  - Background-safe and auto-advances on resume
- User can end early (confirm)
- User sees a **Summary** screen on completion/end with:
  - Done → back to Exercise Detail
  - Repeat → rerun with same config
- **Logged-out persistence:** store session logs locally on device (no API persistence)

---

## Non-Goals
- Workouts/templates (multi-exercise sessions)
- Accounts/auth, cloud sync
- Recording actual reps performed (beyond “Set complete”)
- Advanced analytics dashboards

---

## Data & DTO Requirements

### Exercise Detail must include protocol
If exercises are served by the API, `ExerciseDetail` must include:

- `protocol.kind` in `{ "timed_reps_sets", "weights_reps_sets" }`
- `protocol.default` containing the default config values for that kind

**DTO ownership:**
- DTO schemas/types live in `packages/shared`
- API may import runtime schemas; mobile imports types only

---

## User Flows

### 1) Start session
- From **Exercise Detail**, user taps **Start session**
- Navigate to **Configure Session**

### 2) Configure Session
- Show defaults from `exercise.protocol.default`
- User may edit values (within constraints)
- Block Start if invalid
- Tap **Start** → navigate to **Run Session** (starts with 5s countdown)

### 3) Run Session
Controls:
- Pause/Resume (timed segments only)
- Skip (work + rest)
- Back
- End early (confirm)

Scenario 1 (timed):
- Auto-advances through work/rest across reps/sets

Scenario 2 (weights):
- “Perform Set X/Y (Target reps: N)”
- User taps **Set complete** to advance to rest (between sets)

### 4) Completion
- Local session log must record: exerciseId/name snapshot, startedAt, endedAt, duration, outcome, config snapshot.
- Navigate to **Session Summary**

### 5) Summary
Show:
- Exercise name
- Outcome (Completed / Ended early)
- Total duration
- Config used

Actions:
- **Done** → Exercise Detail
- **Repeat** → rerun using same config

---

## Constraints & Validation (hard-block)
- `sets >= 1`, `repsPerSet >= 1`
- durations are integers `>= 0`
- caps:
  - `sets <= 20`
  - `repsPerSet <= 30`
  - each duration field `<= 600` seconds

---

## Acceptance Criteria (DoD)
- From Exercise Detail, user can run sessions for:
  - at least one `timed_reps_sets` exercise
  - at least one `weights_reps_sets` exercise
- Both scenarios include:
  - 5s countdown
  - skip (work/rest) + back
  - end early confirmation
  - summary screen shown on completion/end
  - Pause/Resume works on timed segments
  - local session log persisted across app restart
- Timer correctness:
  - backgrounding does not break timing
  - resuming auto-advances through elapsed segments correctly
- Unit tests exist for timer logic (see timer-engine.md)
