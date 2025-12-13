# Technical Spec: Timer Engine (Execute Exercise Session)

**Feature:** Execute Exercise Session (logged-out)  
**Purpose:** Define the segment builder and runtime timer engine so behaviour is deterministic and testable.

---

## Product Decisions (fixed)
- Start-of-session countdown: **5 seconds**
- Work → Rest transitions: **immediate**
- Skip: allowed for **work and rest**
- Back: supported for **both scenarios**
- Scenario 2 sets are manual: user taps **Set complete**
- Timer is background-safe:
  - continues accurately while backgrounded
  - on resume, auto-advances through elapsed segments

---

## Protocol Kinds

### Kind A: timed_reps_sets
Config fields:
- `sets`
- `repsPerSet`
- `workSecPerRep`
- `restSecBetweenReps`
- `restSecBetweenSets`

### Kind B: weights_reps_sets
Config fields:
- `sets`
- `repsPerSet`
- `restSecBetweenSets`

---

## Segment Model

### Segment types
```ts
export type Segment =
  | { type: "countdown"; durationSec: number }
  | { type: "work"; setIndex: number; repIndex: number; durationSec: number }
  | { type: "rest_between_reps"; setIndex: number; repIndex: number; durationSec: number }
  | { type: "rest_between_sets"; setIndex: number; durationSec: number }
  | { type: "manual_set"; setIndex: number; targetReps: number };
```

### Zero-duration rule
If a timed segment has `durationSec === 0`, it must be auto-skipped immediately (advance to the next segment).

---

## Segment Builder

### Common
- Always prepend `{ type: "countdown", durationSec: 5 }`

### Build for timed_reps_sets
For each set, for each rep:
- `work(setIndex, repIndex, workSecPerRep)`
- if not last rep: `rest_between_reps(setIndex, repIndex, restSecBetweenReps)`
After reps:
- if not last set: `rest_between_sets(setIndex, restSecBetweenSets)`

### Build for weights_reps_sets
For each set:
- `manual_set(setIndex, repsPerSet)`
- if not last set: `rest_between_sets(setIndex, restSecBetweenSets)`

---

## Timer Engine

### Design goals
- Drift-safe: remaining time is computed from timestamps, not decrementing state
- Deterministic transitions (including background/resume)
- Pure core logic module with unit tests

### Engine state (recommended)
```ts
type EngineState = {
  segments: Segment[];
  activeIndex: number;

  mode: "running" | "paused";

  // For timed segments only
  segmentStartedAtMs: number | null;
  pausedAtMs: number | null;
  pauseAccumulatedMs: number;

  // Session start
  startedAtMs: number;
};
```

### Helper predicates
- `isTimed(segment)` true for countdown/work/rest_between_reps/rest_between_sets
- `isManual(segment)` true for manual_set

### Actions (public API)
- `start(segments, nowMs)`
- `pause(nowMs)`
- `resume(nowMs)`
- `skip(nowMs)` — advance to next segment
- `back(nowMs)` — go to previous segment
- `completeManualSet(nowMs)` — advance when on manual_set
- `endEarly(nowMs)` — mark session ended early

### Time calculation for timed segments
For current timed segment with `durationMs = durationSec * 1000`:
- `elapsedMs = nowMs - segmentStartedAtMs - pauseAccumulatedMs`
- `remainingMs = max(0, durationMs - elapsedMs)`

### Transition rule
When `remainingMs === 0`:
- advance to next segment immediately
- if next segment is timed and has duration 0, keep advancing
- stop advancing when:
  - active segment is manual_set, or
  - active timed segment has remaining > 0, or
  - session finished

### Pause/resume semantics
- Pause only affects timed segments.
- When paused:
  - set `pausedAtMs`
- On resume:
  - `pauseAccumulatedMs += nowMs - pausedAtMs`
  - clear `pausedAtMs`

### Skip semantics
Skip is allowed for any segment:
- advance `activeIndex += 1`
- initialize the new segment timing correctly:
  - if new segment is timed: set `segmentStartedAtMs = nowMs`, keep `pauseAccumulatedMs = 0`
  - if new segment is manual: clear `segmentStartedAtMs`

### Back semantics
Back is allowed for any segment except before index 0:
- `activeIndex = max(0, activeIndex - 1)`
- initialize the new segment as if it is starting now (do NOT attempt to “rewind time”)

### Backgrounding & resume (critical)
On app resume (or periodically), call `sync(nowMs)`:
- If active segment is timed and mode is running:
  - compute remaining
  - while remaining == 0:
    - advance to next segment
    - if finished: stop
    - if manual_set: stop
    - else recompute remaining for new segment
- If mode is paused: do not auto-advance

---

## UI Tick Strategy
- Use a lightweight UI tick (e.g., 250ms or 500ms interval) to refresh displayed remaining time.
- Do NOT store remaining time as state; derive it from timestamps.
- On `AppState` resume, call `sync(nowMs)` immediately.

---

## Required Unit Tests

### Segment builder
- timed_reps_sets: correct sequence and counts
- weights_reps_sets: correct sequence and counts
- countdown always prepended

### Engine
- remaining time computation is correct
- pause/resume maintains remaining time
- skip/back changes active segment as expected
- auto-advances through multiple elapsed segments on resume
- zero-duration segments are skipped automatically
- stops auto-advance when encountering manual_set
