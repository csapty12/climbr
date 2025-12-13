import { z } from 'zod';
import { EXERCISE_CATEGORIES, EXERCISE_DIFFICULTIES, EXERCISE_EQUIPMENT } from './constants';

// Base Enums
export const CategoryEnum = z.enum(EXERCISE_CATEGORIES);
export const DifficultyEnum = z.enum(EXERCISE_DIFFICULTIES);
export const EquipmentEnum = z.enum(EXERCISE_EQUIPMENT);

// Media
export const ExerciseMediaSchema = z.object({
    id: z.string().uuid(),
    type: z.string(), // 'image' | 'video'
    url: z.string().url(),
    alt: z.string(),
    sortOrder: z.number().int().default(0)
});

// Summary (List View)
export const ExerciseSummarySchema = z.object({
    id: z.string().uuid(),
    slug: z.string(),
    name: z.string(),
    summary: z.string(),
    category: CategoryEnum,
    difficulty: DifficultyEnum,
    thumbnailUrl: z.string().optional(),
    equipment: z.array(z.string()).default([]),
    updatedAt: z.string().datetime() // ISO String
});

// Detail View
export const ExerciseDetailSchema = ExerciseSummarySchema.extend({
    instructionsMarkdown: z.string(),
    riskFlags: z.array(z.string()).default([]),
    cues: z.array(z.string()).default([]),
    commonMistakes: z.array(z.string()).default([]),
    protocolTags: z.array(z.string()).default([]),
    media: z.array(ExerciseMediaSchema).default([]),
});

// API Response for List
export const ExercisesListResponseSchema = z.object({
    items: z.array(ExerciseSummarySchema),
    nextCursor: z.string().optional()
});

// API Error
export const ApiErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional()
});

// Query Params Schema for List
export const GetExercisesQuerySchema = z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    difficulty: z.string().optional(),
    equipment: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).default(20),
    cursor: z.string().optional()
});

export type ExerciseCategories = z.infer<typeof CategoryEnum>;
export type ExerciseDifficulties = z.infer<typeof DifficultyEnum>;
export type ExerciseMedia = z.infer<typeof ExerciseMediaSchema>;
export type ExerciseSummary = z.infer<typeof ExerciseSummarySchema>;
export type ExerciseDetail = z.infer<typeof ExerciseDetailSchema>;
export type ExercisesListResponse = z.infer<typeof ExercisesListResponseSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type GetExercisesQuery = z.infer<typeof GetExercisesQuerySchema>;
