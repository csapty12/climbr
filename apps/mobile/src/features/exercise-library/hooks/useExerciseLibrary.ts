import { useState, useRef, useCallback, useEffect } from 'react';
import { getExercises } from '../../../api/client';
import type { ExerciseSummary } from '@climbr/shared';
import { EXERCISE_CATEGORIES, EXERCISE_DIFFICULTIES, EXERCISE_EQUIPMENT } from '../constants';

export const useExerciseLibrary = () => {
    const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);

    // Filter State
    const [searchText, setSearchText] = useState('');
    const [category, setCategory] = useState<string>('all');
    const [difficulty, setDifficulty] = useState<string>('all');
    const [equipment, setEquipment] = useState<string>('all');

    const searchTimeout = useRef<NodeJS.Timeout>();
    const abortController = useRef<AbortController>();

    const fetchExercises = useCallback(async (reset = false, query = '') => {
        if (loading && !reset) return;

        // Cancel previous request
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        try {
            const cursorToUse = reset ? undefined : nextCursor;
            if (!reset && !cursorToUse && exercises.length > 0) {
                setLoading(false);
                return; // End of list
            }

            const res = await getExercises({
                q: query || undefined,
                category: category !== 'all' ? category : undefined,
                difficulty: difficulty !== 'all' ? difficulty : undefined,
                equipment: equipment !== 'all' ? equipment : undefined,
                cursor: cursorToUse,
                limit: 20
            });

            setExercises(prev => reset ? res.items : [...prev, ...res.items]);
            setNextCursor(res.nextCursor);
        } catch (e) {
            if (e instanceof Error && e.name === 'AbortError') return;
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [category, difficulty, equipment, nextCursor, exercises.length, loading]);

    // Handle Search with Debounce
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchExercises(true, searchText);
        }, 500);
        return () => clearTimeout(searchTimeout.current);
    }, [searchText]); // Only re-run when searchText changes

    // Handle Filters immediately
    useEffect(() => {
        // Debounce only search, not filters
        // But we need to ensure we don't race with search debate
        // For simplicity, we just trigger fetch
        fetchExercises(true, searchText);
    }, [category, difficulty, equipment]);

    const loadMore = () => {
        if (nextCursor && !loading) {
            fetchExercises(false, searchText);
        }
    };

    return {
        exercises,
        loading,
        loadMore,
        refresh: () => fetchExercises(true, searchText),
        filters: {
            searchText, setSearchText,
            category, setCategory,
            difficulty, setDifficulty,
            equipment, setEquipment
        },
        constants: {
            categories: ['all', ...EXERCISE_CATEGORIES],
            difficulties: ['all', ...EXERCISE_DIFFICULTIES],
            equipment: ['all', ...EXERCISE_EQUIPMENT]
        }
    };
};
