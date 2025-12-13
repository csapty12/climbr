import { prisma } from './db/prisma';
import fs from 'fs';
import path from 'path';
import { ExerciseSummary } from '@climbr/shared';
// Note: importing ExerciseSummary types from shared is fine, but we need the raw JSON type here which matches our schema
// or we perform runtime validation. For seed, we trust the JSON matches roughly.

async function main() {
    const seedPath = path.join(__dirname, '../seed/exercises.json');
    const rawData = fs.readFileSync(seedPath, 'utf-8');
    const exercises = JSON.parse(rawData);

    console.log(`Seeding ${exercises.length} exercises...`);

    for (const ex of exercises) {
        const { media, ...data } = ex;

        // Upsert exercise
        const created = await prisma.exercise.upsert({
            where: { slug: data.slug },
            update: {
                ...data,
                updatedAt: new Date(),
            },
            create: {
                ...data
            }
        });

        // Handle Media: Delete existing and re-insert
        await prisma.exerciseMedia.deleteMany({
            where: { exerciseId: created.id }
        });

        if (media && media.length > 0) {
            await prisma.exerciseMedia.createMany({
                data: media.map((m: any, idx: number) => ({
                    ...m,
                    exerciseId: created.id,
                    sortOrder: idx
                }))
            });
        }
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
