import type { ExerciseProtocol } from '@climbr/shared';

export type Segment =
    | { type: 'countdown'; durationSec: number }
    | { type: 'work'; setIndex: number; repIndex: number; durationSec: number }
    | { type: 'rest_between_reps'; setIndex: number; repIndex: number; durationSec: number }
    | { type: 'rest_between_sets'; setIndex: number; durationSec: number }
    | { type: 'manual_set'; setIndex: number; targetReps: number };

export function buildSegments(protocol: ExerciseProtocol): Segment[] {
    const segments: Segment[] = [];

    // Always start with a 5s countdown
    segments.push({ type: 'countdown', durationSec: 5 });

    if (protocol.kind === 'timed_reps_sets') {
        const { sets, repsPerSet, workSecPerRep, restSecBetweenReps, restSecBetweenSets } = protocol.default; // Using default for now, later passed in config

        for (let s = 0; s < sets; s++) {
            for (let r = 0; r < repsPerSet; r++) {
                // Work
                segments.push({
                    type: 'work',
                    setIndex: s,
                    repIndex: r,
                    durationSec: workSecPerRep
                });

                // Rest between reps (if not last rep)
                if (r < repsPerSet - 1) {
                    segments.push({
                        type: 'rest_between_reps',
                        setIndex: s,
                        repIndex: r,
                        durationSec: restSecBetweenReps
                    });
                }
            }

            // Rest between sets (if not last set)
            if (s < sets - 1) {
                segments.push({
                    type: 'rest_between_sets',
                    setIndex: s,
                    durationSec: restSecBetweenSets
                });
            }
        }
    } else if (protocol.kind === 'weights_reps_sets') {
        const { sets, repsPerSet, restSecBetweenSets } = protocol.default;

        for (let s = 0; s < sets; s++) {
            // Manual Set
            segments.push({
                type: 'manual_set',
                setIndex: s,
                targetReps: repsPerSet
            });

            // Rest between sets (if not last set)
            if (s < sets - 1) {
                segments.push({
                    type: 'rest_between_sets',
                    setIndex: s,
                    durationSec: restSecBetweenSets
                });
            }
        }
    }

    return segments;
}

// Helper to support custom config overrides later
export function buildSegmentsWithConfig(protocolKind: ExerciseProtocol['kind'], config: any): Segment[] {
    // This is a placeholder for when we actually accept user config from the UI
    // For now, we just map the config shape back to what the logic expects
    // In strict impl, we would use a discriminated union for Config too.
    return buildSegments({ kind: protocolKind, default: config } as any);
}
