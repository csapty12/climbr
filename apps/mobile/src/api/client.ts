import { ExercisesListResponse, ExerciseDetail, GetExercisesQuery } from '@climbr/shared'; // Type-only import is assumed by usage context (ignoring values)
// Actually we need to be careful not to import VALUES from shared if it has Node-stuff.
// created packages/shared has no side-effects, just Zod schemas and constants.
// Importing constants (CATEGORIES) is fine even in mobile if no Node-polylibs needed.
// But user rule: "Mobile can import shared TYPES only (type-only imports)".
// So I should use `import type`.
// But I might want the Enum values for the UI filters?
// The user rule said: "Mobile can import shared TYPES only (type-only imports) to avoid runtime bundling issues."
// So I must NOT import the constants. I should duplicate them or hardcode them in Mobile UI.

import type {
    ExerciseSummary,
    ExerciseDetail as SharedExerciseDetail,
    ExercisesListResponse as SharedListResponse,
    GetExercisesQuery as SharedQuery
} from '@climbr/shared';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/v1';

export async function getExercises(params: SharedQuery): Promise<SharedListResponse> {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.category && params.category !== 'all') searchParams.append('category', params.category);
    if (params.difficulty && params.difficulty !== 'all') searchParams.append('difficulty', params.difficulty);
    if (params.equipment && params.equipment !== 'all') searchParams.append('equipment', params.equipment);
    if (params.limit) searchParams.append('limit', String(params.limit));
    if (params.cursor) searchParams.append('cursor', params.cursor);

    const res = await fetch(`${BASE_URL}/exercises?${searchParams.toString()}`);
    if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
    }
    return res.json();
}

export async function getExerciseDetail(idOrSlug: string): Promise<SharedExerciseDetail> {
    const res = await fetch(`${BASE_URL}/exercises/${idOrSlug}`);
    if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
    }
    return res.json();
}
