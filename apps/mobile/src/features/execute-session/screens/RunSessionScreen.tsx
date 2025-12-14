import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRoute, useNavigation, RouteProp, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getExerciseDetail } from '../../../api/client';
import type { ExerciseDetail } from '@climbr/shared';
import { RootStackParamList } from '../../../../App';
import { useSessionRunner } from '../hooks/useSessionRunner';

export const RunSessionScreen = () => {
    const route = useRoute<RouteProp<RootStackParamList, 'RunSession'>>();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { exerciseId } = route.params;

    const [detail, setDetail] = useState<ExerciseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Runner Hook
    // We pass undefined initially while loading, loop updates when detail is set
    const { state, remainingSec, actions, activeSegment } = useSessionRunner(detail?.protocol);

    // Fetch Detail
    const fetchExercise = useCallback(() => {
        setLoading(true);
        setError(null);
        getExerciseDetail(exerciseId)
            .then(setDetail)
            .catch((err) => {
                console.error('Failed to load exercise:', err);
                setError('Failed to load exercise. Please check your connection and try again.');
            })
            .finally(() => setLoading(false));
    }, [exerciseId]);

    useEffect(() => {
        fetchExercise();
    }, [fetchExercise]);

    // Auto-Start when detail (and protocol) is ready
    useEffect(() => {
        if (detail && detail.protocol && state.mode === 'paused' && state.startedAtMs === 0) {
            // Only start if not already started (startedAtMs check is a proxy for "fresh engine")
            // Actually `startedAtMs` is 0 by default.
            actions.start();
        }
    }, [detail, state.mode, state.startedAtMs, actions]);

    // Auto-Navigate on Complete
    useEffect(() => {
        if (state.mode === 'completed') {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [
                        { name: 'ExerciseLibrary' }, // Or ExerciseDetail? Library is safer root.
                        { name: 'SessionSummary', params: { exerciseId: exerciseId, result: { endReason: 'completed' } } },
                    ],
                })
            );
        }
    }, [state.mode, navigation, exerciseId]);

    if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

    if (error) return (
        <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchExercise}>
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    if (!detail) return <View style={styles.center}><Text>Exercise not found</Text></View>;

    const isRunning = state.mode === 'running';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{detail.name}</Text>
            </View>

            <View style={styles.timerContainer}>
                {activeSegment ? (
                    <>
                        <Text style={styles.segmentType}>{mapSegmentType(activeSegment.type)}</Text>

                        {activeSegment.type === 'manual_set' ? (
                            <View>
                                <Text style={styles.timerText}>Do {activeSegment.targetReps} Reps</Text>
                            </View>
                        ) : (
                            <Text style={[styles.timerText, getTimerColor(activeSegment.type)]}>{formatTime(remainingSec)}</Text>
                        )}

                        <Text style={styles.segmentInfo}>
                            {'setIndex' in activeSegment && `Set ${activeSegment.setIndex + 1}`}
                            {'repIndex' in activeSegment && ` / Rep ${activeSegment.repIndex + 1}`}
                        </Text>
                    </>
                ) : (
                    <Text>Loading...</Text>
                )}
            </View>

            <View style={styles.controls}>
                <TouchableOpacity style={styles.btnSecondary} onPress={actions.back}>
                    <Text style={styles.btnText}>Prev</Text>
                </TouchableOpacity>

                {activeSegment?.type === 'manual_set' ? (
                    <TouchableOpacity style={styles.btnPrimary} onPress={actions.completeManualSet}>
                        <Text style={styles.btnText}>Done</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.btnPrimary} onPress={isRunning ? actions.pause : actions.resume}>
                        <Text style={styles.btnText}>{isRunning ? 'Pause' : 'Resume'}</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.btnSecondary} onPress={actions.skip}>
                    <Text style={styles.btnText}>Skip</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.endLink} onPress={actions.endEarly}>
                <Text style={styles.endLinkText}>End Session</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const mapSegmentType = (type: string) => {
    switch (type) {
        case 'countdown': return 'Get Ready';
        case 'work': return 'Work';
        case 'rest_between_reps': return 'Rest (Rep)';
        case 'rest_between_sets': return 'Rest (Set)';
        case 'manual_set': return 'Manual Set';
        default: return type;
    }
}

const getTimerColor = (type: string) => {
    if (type === 'work' || type === 'manual_set') return { color: '#4CAF50' }; // Green
    if (type.includes('rest')) return { color: '#FF9800' }; // Orange
    return { color: '#2196F3' }; // Blue (Countdown)
}

const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: '#ff4444', fontSize: 16, textAlign: 'center', marginBottom: 20 },
    retryButton: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
    retryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    header: { padding: 20, alignItems: 'center' },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    timerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    segmentType: { color: '#aaa', fontSize: 24, marginBottom: 10, textTransform: 'uppercase' },
    timerText: { fontSize: 80, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
    segmentInfo: { color: '#888', marginTop: 20, fontSize: 16 },
    controls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 30 },
    btnPrimary: { backgroundColor: '#fff', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
    btnSecondary: { backgroundColor: '#333', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#000', fontWeight: 'bold' },
    endLink: { alignItems: 'center', paddingBottom: 20 },
    endLinkText: { color: '#ff4444' }
});
