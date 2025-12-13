-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "equipment" TEXT[],
    "riskFlags" TEXT[],
    "instructionsMarkdown" TEXT NOT NULL,
    "cues" TEXT[],
    "commonMistakes" TEXT[],
    "protocolTags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseMedia" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExerciseMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_slug_key" ON "Exercise"("slug");

-- CreateIndex
CREATE INDEX "Exercise_updatedAt_id_idx" ON "Exercise"("updatedAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "ExerciseMedia_exerciseId_idx" ON "ExerciseMedia"("exerciseId");

-- AddForeignKey
ALTER TABLE "ExerciseMedia" ADD CONSTRAINT "ExerciseMedia_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
