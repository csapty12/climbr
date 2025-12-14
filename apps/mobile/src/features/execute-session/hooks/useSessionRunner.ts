import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { TimerEngine, EngineState } from '../engine/timerEngine';
import { buildSegments, Segment } from '../engine/segmentBuilder';
import { ExerciseProtocol } from '@climbr/shared';

// UI Tick Rate
const TICK_MS = 200;

export const useSessionRunner = (protocol: ExerciseProtocol | undefined) => {
    // Engine definition
    // We use a ref for the engine to avoid re-instantiating it,
    // but we need a state copy to trigger re-renders.
    const engineRef = useRef<TimerEngine>(new TimerEngine());
    const [engineState, setEngineState] = useState<EngineState>(engineRef.current.getState());

    // Derived UI state
    const [uiRemainingSec, setUiRemainingSec] = useState(0);

    // Sync Helper
    const syncState = useCallback(() => {
        const now = Date.now();
        engineRef.current.sync(now);
        setEngineState(engineRef.current.getState());
        setUiRemainingSec(engineRef.current.getRemainingSec(now));
    }, []);

    // Keep ref updated for AppState listener
    const syncStateRef = useRef(syncState);
    useEffect(() => {
        syncStateRef.current = syncState;
    }, [syncState]);

    // 1. UI Ticker
    useEffect(() => {
        if (engineState.mode !== 'running') return;

        const interval = setInterval(() => {
            syncState();
        }, TICK_MS);

        return () => clearInterval(interval);
    }, [engineState.mode, syncState]);

    // 2. App State Handler (Backgrounding) - Fixed memory leak
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                // Use ref to avoid recreating listener
                syncStateRef.current();
            }
        });

        return () => subscription.remove();
    }, []); // Empty deps - runs once

    // Public Actions
    const start = useCallback(() => {
        if (!protocol) return;
        const now = Date.now();
        const segments = buildSegments(protocol);
        engineRef.current.start(segments, now);
        syncState();
    }, [protocol, syncState]);

    const pause = useCallback(() => {
        engineRef.current.pause(Date.now());
        syncState();
    }, [syncState]);

    const resume = useCallback(() => {
        engineRef.current.resume(Date.now());
        syncState();
    }, [syncState]);

    const skip = useCallback(() => {
        engineRef.current.skip(Date.now());
        syncState();
    }, [syncState]);

    const back = useCallback(() => {
        engineRef.current.back(Date.now());
        syncState();
    }, [syncState]);

    const completeManualSet = useCallback(() => {
        engineRef.current.completeManualSet(Date.now());
        syncState();
    }, [syncState]);

    const endEarly = useCallback(() => {
        engineRef.current.endEarly(Date.now());
        syncState();
    }, [syncState]);

    // Memoize actions to prevent unnecessary re-renders
    const actions = useMemo(() => ({
        start,
        pause,
        resume,
        skip,
        back,
        completeManualSet,
        endEarly
    }), [start, pause, resume, skip, back, completeManualSet, endEarly]);

    return {
        state: engineState,
        remainingSec: uiRemainingSec,
        actions,
        // Helper to get active segment safely
        activeSegment: engineState.segments[engineState.activeIndex] as Segment | undefined
    };
};
