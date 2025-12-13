import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../../App';
import { FilterModal } from '../../../components/FilterModal';
import { useExerciseLibrary } from '../hooks/useExerciseLibrary';
import type { ExerciseSummary } from '@climbr/shared';

export const ExerciseLibraryScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { exercises, loading, loadMore, refresh, filters, constants } = useExerciseLibrary();
    const [activeFilter, setActiveFilter] = useState<'category' | 'difficulty' | 'equipment' | null>(null);

    const renderItem = ({ item }: { item: ExerciseSummary }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ExerciseDetail', { id: item.slug })}
        >
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSummary}>{item.summary}</Text>
                <View style={styles.tags}>
                    <Text style={styles.tag}>{item.category}</Text>
                    <Text style={styles.tag}>{item.difficulty}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.search}
                    placeholder="Search..."
                    value={filters.searchText}
                    onChangeText={filters.setSearchText}
                />

                <View style={styles.filters}>
                    <FilterButton
                        label="Cat"
                        value={filters.category}
                        onPress={() => setActiveFilter('category')}
                    />
                    <FilterButton
                        label="Diff"
                        value={filters.difficulty}
                        onPress={() => setActiveFilter('difficulty')}
                    />
                    <FilterButton
                        label="Equip"
                        value={filters.equipment}
                        onPress={() => setActiveFilter('equipment')}
                    />
                </View>

                {/* Modals */}
                <FilterModal
                    visible={activeFilter === 'category'}
                    title="Select Category"
                    options={constants.categories}
                    selectedValue={filters.category}
                    onClose={() => setActiveFilter(null)}
                    onSelect={filters.setCategory}
                />
                <FilterModal
                    visible={activeFilter === 'difficulty'}
                    title="Select Difficulty"
                    options={constants.difficulties}
                    selectedValue={filters.difficulty}
                    onClose={() => setActiveFilter(null)}
                    onSelect={filters.setDifficulty}
                />
                <FilterModal
                    visible={activeFilter === 'equipment'}
                    title="Select Equipment"
                    options={constants.equipment}
                    selectedValue={filters.equipment}
                    onClose={() => setActiveFilter(null)}
                    onSelect={filters.setEquipment}
                />
            </View>

            <FlatList
                data={exercises}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loading ? <ActivityIndicator /> : null}
                onRefresh={refresh}
                refreshing={loading && exercises.length === 0}
            />
        </SafeAreaView>
    );
};

const FilterButton = ({ label, value, onPress }: { label: string, value: string, onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={styles.filterBtn}>
        <Text style={styles.filterText}>{label}: {value}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f1f1' },
    header: { padding: 10, backgroundColor: 'white', elevation: 2 },
    search: { backgroundColor: '#eee', padding: 10, borderRadius: 8, marginBottom: 10 },
    filters: { flexDirection: 'row', justifyContent: 'space-between' },
    filterBtn: { padding: 5, backgroundColor: '#ddd', borderRadius: 4 },
    filterText: { fontSize: 12 },
    card: { backgroundColor: 'white', margin: 10, padding: 15, borderRadius: 10, elevation: 1 },
    cardContent: {},
    cardTitle: { fontSize: 18, fontWeight: 'bold' },
    cardSummary: { color: '#666', marginTop: 5 },
    tags: { flexDirection: 'row', marginTop: 10, gap: 5 },
    tag: { fontSize: 10, backgroundColor: '#eee', padding: 3, borderRadius: 3, overflow: 'hidden' }
});
