import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getExerciseDetail } from '../../../api/client'; // Adjust path if needed or use alias
import type { ExerciseDetail } from '@climbr/shared';
import { RootStackParamList } from '../../../../App';

// We might need to adjust imports depending on folder structure
// src/features/execute-session/screens/ConfigureSessionScreen.tsx -> ../../../api/client

export const ConfigureSessionScreen = () => {
    const route = useRoute<RouteProp<RootStackParamList, 'ConfigureSession'>>();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { exerciseId } = route.params;

    const [detail, setDetail] = useState<ExerciseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const handleStart = () => {
        if (!detail || !detail.protocol) return;
        navigation.navigate('RunSession', {
            exerciseId: detail.id,
            config: detail.protocol.default
        });
    };

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

    if (!detail.protocol) return (
        <View style={styles.center}>
            <Text style={styles.subtitle}>This exercise doesn't support timed sessions</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{detail.name}</Text>
            <Text style={styles.subtitle}>Protocol: {detail.protocol.kind}</Text>

            <View style={styles.configContainer}>
                <Text style={styles.code}>{JSON.stringify(detail.protocol.default, null, 2)}</Text>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                <Text style={styles.startButtonText}>GO!</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 18, color: '#666', marginBottom: 20, textAlign: 'center' },
    configContainer: { backgroundColor: '#f0f0f0', padding: 20, borderRadius: 10, width: '100%', marginBottom: 30 },
    code: { fontFamily: 'monospace' },
    startButton: { backgroundColor: '#00C853', paddingVertical: 20, paddingHorizontal: 60, borderRadius: 50 },
    startButtonText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    errorText: { color: '#ff4444', fontSize: 16, textAlign: 'center', marginBottom: 20 },
    retryButton: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
    retryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    backButton: { backgroundColor: '#666', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginTop: 10 },
    backButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
