import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../App';

export const SessionSummaryScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const handleDone = () => {
        navigation.popToTop(); // Go back to Library
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Session Complete!</Text>
            <Text style={styles.subtitle}>Great work.</Text>

            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 20 },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10, color: '#4CAF50' },
    subtitle: { fontSize: 18, color: '#666', marginBottom: 40 },
    doneButton: { backgroundColor: '#333', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
    doneButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
