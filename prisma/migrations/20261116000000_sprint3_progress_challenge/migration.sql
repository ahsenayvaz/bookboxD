-- Sprint 3: Lesefortschritt, Lese-Streak, Reading Challenge (ID-13, ID-21, ID-22)

-- AlterTable: Abschlusszeitpunkt für die Reading Challenge
ALTER TABLE "LibraryEntry" ADD COLUMN     "finishedAt" TIMESTAMP(3);

-- Bereits als „Gelesen“ markierte Bücher übernehmen den letzten Änderungszeitpunkt
UPDATE "LibraryEntry" SET "finishedAt" = "updatedAt" WHERE "status" = 'READ';

-- Falls es mehrere Leseeinträge pro Nutzer, Buch und Tag gibt: zusammenfassen, bevor der Unique-Index entsteht
WITH merged AS (
    SELECT MIN("id") AS "keepId", "userId", "bookId", "date", SUM("pagesRead") AS "total"
    FROM "ReadingLog"
    GROUP BY "userId", "bookId", "date"
    HAVING COUNT(*) > 1
)
UPDATE "ReadingLog" r SET "pagesRead" = m."total"
FROM merged m
WHERE r."id" = m."keepId";

DELETE FROM "ReadingLog" r
USING "ReadingLog" o
WHERE r."userId" = o."userId" AND r."bookId" = o."bookId" AND r."date" = o."date" AND r."id" > o."id";

-- CreateTable
CREATE TABLE "ReadingChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "goal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReadingChallenge_userId_year_key" ON "ReadingChallenge"("userId", "year");

-- CreateIndex
CREATE INDEX "LibraryEntry_userId_status_finishedAt_idx" ON "LibraryEntry"("userId", "status", "finishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingLog_userId_bookId_date_key" ON "ReadingLog"("userId", "bookId", "date");

-- AddForeignKey
ALTER TABLE "ReadingChallenge" ADD CONSTRAINT "ReadingChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase: neue Tabelle ebenfalls für die öffentliche REST-API sperren (siehe Init-Migration)
ALTER TABLE "ReadingChallenge" ENABLE ROW LEVEL SECURITY;
