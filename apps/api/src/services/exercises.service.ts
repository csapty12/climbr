import { prisma } from '../db/prisma';
import {
    GetExercisesQuery,
    ExerciseSummary,
    ExerciseDetail,
    ExerciseProtocolDataSchema,
    ExerciseCategories,
    ExerciseDifficulties
} from '@climbr/shared';
import { decodeCursor, encodeCursor } from '../lib/pagination';
import { notFound } from '../lib/errors';
import { Prisma } from '@prisma/client';

export class ExerciseService {
    async getExercises(query: GetExercisesQuery) {
        const { q, category, difficulty, equipment, limit, cursor } = query;
        const take = limit;

        const where: Prisma.ExerciseWhereInput = {};

        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { summary: { contains: q, mode: 'insensitive' } }
            ];
        }

        if (category && category !== 'all') where.category = category;
        if (difficulty && difficulty !== 'all') where.difficulty = difficulty;
        if (equipment && equipment !== 'all') where.equipment = { has: equipment };

        let cursorObj = undefined;
        if (cursor) {
            const decoded = decodeCursor(cursor);
            if (decoded) {
                cursorObj = {
                    updatedAt: decoded.updatedAt,
                    id: decoded.id
                };
            }
        }

        const items = await prisma.exercise.findMany({
            where,
            take: take + 1, // Fetch one extra to check for next page
            cursor: cursorObj ? { id: cursorObj.id } : undefined,
            orderBy: [
                { updatedAt: 'desc' },
                { id: 'desc' }
            ],
            skip: cursorObj ? 1 : 0,
            include: {
                media: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1
                }
            }
        });

        let nextCursor = undefined;
        if (items.length > take) {
            const nextItem = items.pop(); // Remove the extra item
            if (nextItem) { // Should exist
                // The cursor for the NEXT page is the LAST item of CURRENT page
                const lastItem = items[items.length - 1];
                nextCursor = encodeCursor(lastItem.updatedAt, lastItem.id);
            }
        }

        const summaryItems: ExerciseSummary[] = items.map(item => ({
            id: item.id,
            slug: item.slug,
            name: item.name,
            summary: item.summary,
            category: item.category as ExerciseCategories,
            difficulty: item.difficulty as ExerciseDifficulties,
            equipment: item.equipment,
            updatedAt: item.updatedAt.toISOString(),
            thumbnailUrl: item.media[0]?.url
        }));

        return {
            items: summaryItems,
            nextCursor
        };
    }

    async getExercise(idOrSlug: string): Promise<ExerciseDetail> {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

        const where: Prisma.ExerciseWhereUniqueInput = isUuid
            ? { id: idOrSlug }
            : { slug: idOrSlug };

        const exercise = await prisma.exercise.findUnique({
            where,
            include: {
                media: {
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });

        if (!exercise) {
            throw notFound(`Exercise not found: ${idOrSlug}`);
        }

        // Validate protocol data from database using Zod
        let validatedProtocol = undefined;
        if (exercise.protocol) {
            try {
                validatedProtocol = ExerciseProtocolDataSchema.parse(exercise.protocol);
            } catch (error) {
                console.error('Invalid protocol data in database:', error);
                // Protocol is optional, so we can continue without it
            }
        }

        return {
            ...exercise,
            category: exercise.category as ExerciseCategories,
            difficulty: exercise.difficulty as ExerciseDifficulties,
            protocol: validatedProtocol,
            updatedAt: exercise.updatedAt.toISOString(),
            media: exercise.media.map(m => ({
                id: m.id,
                type: m.type,
                url: m.url,
                alt: m.alt,
                sortOrder: m.sortOrder
            }))
        };
    }
}

export const exerciseService = new ExerciseService();
