import { Segment } from './segmentBuilder';

export type EngineState = {
    segments: Segment[];
    activeIndex: number;
    mode: 'running' | 'paused' | 'completed';

    // Timer state for current segment
    segmentStartedAtMs: number | null;
    pausedAtMs: number | null;
    pauseAccumulatedMs: number;

    // Session meta
    startedAtMs: number;
    endedAtMs: number | null;
};

export class TimerEngine {
    private state: EngineState;

    constructor(initialState?: EngineState) {
        this.state = initialState || {
            segments: [],
            activeIndex: 0,
            mode: 'paused', // Wait for start
            segmentStartedAtMs: null,
            pausedAtMs: null,
            pauseAccumulatedMs: 0,
            startedAtMs: 0,
            endedAtMs: null
        };
    }

    getState(): EngineState {
        return { ...this.state };
    }

    start(segments: Segment[], nowMs: number) {
        this.state = {
            segments,
            activeIndex: 0,
            mode: 'running',
            segmentStartedAtMs: nowMs,
            pausedAtMs: null,
            pauseAccumulatedMs: 0,
            startedAtMs: nowMs,
            endedAtMs: null
        };
        // Check for zero-duration first segment (unlikely for countdown, but safe)
        this.autoAdvance(nowMs);
    }

    pause(nowMs: number) {
        if (this.state.mode !== 'running') return;

        // Allow pausing all segment types including manual sets
        this.state.mode = 'paused';
        this.state.pausedAtMs = nowMs;
    }

    resume(nowMs: number) {
        if (this.state.mode !== 'paused') return;

        if (this.state.pausedAtMs) {
            this.state.pauseAccumulatedMs += (nowMs - this.state.pausedAtMs);
            this.state.pausedAtMs = null;
        }
        this.state.mode = 'running';
    }

    // Manual skip (next)
    skip(nowMs: number) {
        if (this.state.mode === 'completed') return;
        this.advanceSegment(nowMs);
    }

    // Manual back (previous)
    back(nowMs: number) {
        if (this.state.activeIndex > 0) {
            this.state.activeIndex--;
            this.initSegment(nowMs);
            if (this.state.mode === 'completed') {
                this.state.mode = 'running';
                this.state.endedAtMs = null;
            }
        }
    }

    // Explicit complete for manual sets
    completeManualSet(nowMs: number) {
        const activeSeg = this.state.segments[this.state.activeIndex];
        if (activeSeg && activeSeg.type === 'manual_set') {
            this.advanceSegment(nowMs);
        }
    }

    // End session early
    endEarly(nowMs: number) {
        this.state.mode = 'completed';
        this.state.endedAtMs = nowMs;
    }

    // Sync is called on tick or resume to update state based on time
    sync(nowMs: number) {
        if (this.state.mode === 'running') {
            this.autoAdvance(nowMs);
        }
    }

    // Core logic: recursively advance if time is up
    private autoAdvance(nowMs: number) {
        if (this.state.mode !== 'running') return;
        if (this.state.segmentStartedAtMs === null) return;

        let activeSeg = this.state.segments[this.state.activeIndex];

        // Loop to catch up multiple segments if needed
        while (activeSeg && activeSeg.type !== 'manual_set') {
            const durationMs = activeSeg.durationSec * 1000;
            const elapsed = nowMs - this.state.segmentStartedAtMs - this.state.pauseAccumulatedMs;

            if (elapsed >= durationMs) {
                // Segment completed
                // We want to "bank" this duration and move the start time forward
                // effectively: segmentStartedAtMs += durationMs
                // This preserves exact timing intervals

                this.state.segmentStartedAtMs += durationMs;
                this.state.activeIndex++;

                // Check if finished context
                if (this.state.activeIndex >= this.state.segments.length) {
                    this.state.mode = 'completed';
                    this.state.endedAtMs = this.state.segmentStartedAtMs; // Effectively finished exactly when time ran out
                    return;
                }

                activeSeg = this.state.segments[this.state.activeIndex];

                // If we hit a manual set, we must STOP catching up and reset the start time to NOW
                // because manual sets don't finish by themselves.
                // Wait: if we "arrive" at a manual set 5 seconds "ago" (virtually), 
                // we shouldn't auto-complete it. We just stop there.
                // Resetting starTime to nowMs prevents "negative elapsed" or weird states?
                // Actually manual sets don't have timers. So clearing start time is correct.
                if (activeSeg.type === 'manual_set') {
                    this.state.segmentStartedAtMs = null;
                    return;
                }
            } else {
                // Not finished yet
                break;
            }
        }
    }

    private getElapsedMs(nowMs: number): number {
        if (this.state.segmentStartedAtMs === null) return 0;
        return nowMs - this.state.segmentStartedAtMs - this.state.pauseAccumulatedMs;
    }

    // Returns remaining seconds for UI
    getRemainingSec(nowMs: number): number {
        const activeSeg = this.state.segments[this.state.activeIndex];
        if (!activeSeg || activeSeg.type === 'manual_set') return 0;

        const durationMs = activeSeg.durationSec * 1000;
        const elapsed = this.getElapsedMs(nowMs);
        return Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
    }

    // Internal: Move to next segment
    private advanceSegment(nowMs: number) {
        if (this.state.activeIndex < this.state.segments.length - 1) {
            this.state.activeIndex++;
            this.initSegment(nowMs);
        } else {
            this.state.mode = 'completed';
            this.state.endedAtMs = nowMs;
        }
    }

    private initSegment(nowMs: number) {
        this.state.segmentStartedAtMs = nowMs;
        this.state.pauseAccumulatedMs = 0;
        this.state.pausedAtMs = this.state.mode === 'paused' ? nowMs : null;
    }
}
