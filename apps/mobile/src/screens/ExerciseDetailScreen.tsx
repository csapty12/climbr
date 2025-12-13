import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getExerciseDetail } from '../api/client';
import type { ExerciseDetail } from '@climbr/shared';
import Markdown from 'react-native-markdown-display';
import { RootStackParamList } from '../../App';

export const ExerciseDetailScreen = () => {
    const route = useRoute<RouteProp<RootStackParamList, 'ExerciseDetail'>>();
    const { id } = route.params;
    const [detail, setDetail] = useState<ExerciseDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getExerciseDetail(id)
            .then(setDetail)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
    if (!detail) return <View style={styles.center}><Text>Not Found</Text></View>;

    return (
        <ScrollView style={styles.container}>
            {detail.media && detail.media.length > 0 && (
                <ScrollView horizontal style={styles.mediaContainer}>
                    {detail.media.map(m => (
                        <Image
                            key={m.id}
                            source={{ uri: m.url.startsWith('http') ? m.url : `${process.env.EXPO_PUBLIC_API_BASE_URL?.replace('/v1', '')}${m.url}` }}
                            style={styles.image}
                        />
                    ))}
                </ScrollView>
            )}

            <View style={styles.content}>
                <Text style={styles.title}>{detail.name}</Text>
                <View style={styles.badges}>
                    <Text style={styles.badge}>{detail.category}</Text>
                    <Text style={styles.badge}>{detail.difficulty}</Text>
                </View>

                <Text style={styles.sectionHeader}>Instructions</Text>
                <Markdown>{detail.instructionsMarkdown}</Markdown>

                <Text style={styles.sectionHeader}>Cues</Text>
                {detail.cues.map(c => <Text key={c} style={styles.bullet}>• {c}</Text>)}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    mediaContainer: { height: 200, backgroundColor: '#000' },
    image: { width: 300, height: 200, resizeMode: 'cover', marginRight: 10 },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    badges: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    badge: { backgroundColor: '#eee', padding: 5, borderRadius: 5 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    bullet: { fontSize: 16, marginBottom: 5 }
});
