import { TimerEngine } from './timerEngine';
import { Segment } from './segmentBuilder';
import { describe, it, expect, beforeEach } from 'vitest';

const mockSegments: Segment[] = [
    { type: 'countdown', durationSec: 5 },
    { type: 'work', setIndex: 0, repIndex: 0, durationSec: 10 },
    { type: 'rest_between_reps', setIndex: 0, repIndex: 0, durationSec: 5 },
    { type: 'work', setIndex: 0, repIndex: 1, durationSec: 10 }
];

describe('TimerEngine', () => {
    let engine: TimerEngine;

    beforeEach(() => {
        engine = new TimerEngine();
    });

    it('starts correctly', () => {
        const now = 1000;
        engine.start(mockSegments, now);
        const state = engine.getState();
        expect(state.mode).toBe('running');
        expect(state.activeIndex).toBe(0); // Countdown
        expect(state.segmentStartedAtMs).toBe(now);
    });

    it('calculates remaining time', () => {
        const start = 1000;
        engine.start(mockSegments, start);

        // 2 seconds elapsed
        expect(engine.getRemainingSec(start + 2000)).toBe(3); // 5 - 2 = 3
    });

    it('advances segment when time up (autoAdvance)', () => {
        const start = 1000;
        engine.start(mockSegments, start);

        // Advance 5 seconds (countdown done)
        engine.sync(start + 5000);

        let state = engine.getState();
        // Should have moved to next segment (Work 10s)
        expect(state.activeIndex).toBe(1);
        // Start time should have shifted by exactly 5000ms
        expect(state.segmentStartedAtMs).toBe(start + 5000);
    });

    it('catches up multiple segments (Resume scenario)', () => {
        const start = 0;
        engine.start(mockSegments, start);

        // Skip 5s (countdown) + 10s (work) + 2s into rest
        // Total 17s
        engine.sync(17000);

        const state = engine.getState();
        expect(state.activeIndex).toBe(2); // Rest
        expect(state.segmentStartedAtMs).toBe(15000); // Start + 5000 + 10000

        // Remaining rest should be 5 - 2 = 3
        expect(engine.getRemainingSec(17000)).toBe(3);
    });

    it('pauses and resumes', () => {
        const start = 0;
        engine.start(mockSegments, start);

        // Run 2s
        engine.pause(2000);
        let state = engine.getState();
        expect(state.mode).toBe('paused');
        expect(state.pausedAtMs).toBe(2000);

        // Wait 10s while paused
        engine.resume(12000); // 10s gap

        state = engine.getState();
        expect(state.mode).toBe('running');
        expect(state.pauseAccumulatedMs).toBe(10000);

        // Elapsed logic: now(12000) - start(0) - paused(10000) = 2000
        // Remaining countdown (5s) - 2s = 3s
        expect(engine.getRemainingSec(12000)).toBe(3);
    });
});
