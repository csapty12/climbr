import { buildSegments } from './segmentBuilder';
import { describe, it, expect } from 'vitest';

describe('SegmentBuilder', () => {
    it('always starts with countdown', () => {
        const segments = buildSegments({
            kind: 'timed_reps_sets',
            default: { sets: 1, repsPerSet: 1, workSecPerRep: 5, restSecBetweenReps: 5, restSecBetweenSets: 60 }
        });
        expect(segments[0]).toEqual({ type: 'countdown', durationSec: 5 });
    });

    it('builds timed_reps_sets correctly', () => {
        // 2 sets, 2 reps.
        // Expect: Countdown, Work(0,0), RestRep(0,0), Work(0,1), RestSet(0), Work(1,0), RestRep(1,0), Work(1,1)
        // Total: 1 + (2*2 work) + (2*1 restrep) + (1 restset) = 1 + 4 + 2 + 1 = 8 segments
        const segments = buildSegments({
            kind: 'timed_reps_sets',
            default: {
                sets: 2,
                repsPerSet: 2,
                workSecPerRep: 10,
                restSecBetweenReps: 5,
                restSecBetweenSets: 60
            }
        });

        expect(segments.length).toBe(8);
        expect(segments[1].type).toBe('work');
        expect(segments[2].type).toBe('rest_between_reps');
        expect(segments[3].type).toBe('work');
        expect(segments[4].type).toBe('rest_between_sets');
        expect(segments[5].type).toBe('work');
        expect(segments[6].type).toBe('rest_between_reps');
        expect(segments[7].type).toBe('work');
    });

    it('builds weights_reps_sets correctly', () => {
        // 2 sets.
        // Expect: Countdown, Manual(0), RestSet(0), Manual(1)
        // Total: 1 + 1 + 1 + 1 = 4
        const segments = buildSegments({
            kind: 'weights_reps_sets',
            default: { sets: 2, repsPerSet: 5, restSecBetweenSets: 60 }
        });

        expect(segments.length).toBe(4);
        expect(segments[1].type).toBe('manual_set');
        expect(segments[2].type).toBe('rest_between_sets');
        expect(segments[3].type).toBe('manual_set');
    });
});
