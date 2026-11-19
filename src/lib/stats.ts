import "server-only";
import { prisma } from "./db";

const DAY_MS = 86_400_000;

function todayKey() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
}

// Heutiges Datum (in Istanbul) als UTC-Mitternacht – passend zur `@db.Date`-Spalte
export function today() {
  return new Date(`${todayKey()}T00:00:00Z`);
}

// Aufeinanderfolgende Tage mit Leseeintrag. Der Streak gilt als nicht unterbrochen,
// solange gestern gelesen wurde und der heutige Tag noch läuft.
export function currentStreak(days: string[]) {
  const set = new Set(days);
  let cursor = today();
  if (!set.has(cursor.toISOString().slice(0, 10))) cursor = new Date(cursor.getTime() - DAY_MS);

  let streak = 0;
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}

export async function getProfileStats(userId: string) {
  const startOfYear = new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1));

  const [byStatus, readThisYear, reviews, logs] = await Promise.all([
    prisma.libraryEntry.groupBy({ by: ["status"], where: { userId }, _count: true }),
    prisma.libraryEntry.count({ where: { userId, status: "READ", updatedAt: { gte: startOfYear } } }),
    prisma.review.count({ where: { userId, published: true } }),
    prisma.readingLog.findMany({
      where: { userId, date: { gte: new Date(Date.now() - 400 * DAY_MS) } },
      select: { date: true },
      distinct: ["date"],
    }),
  ]);

  const count = (status: string) => byStatus.find((s) => s.status === status)?._count ?? 0;

  return {
    read: count("READ"),
    reading: count("READING"),
    wantToRead: count("WANT_TO_READ"),
    readThisYear,
    reviews,
    streak: currentStreak(logs.map((l) => l.date.toISOString().slice(0, 10))),
  };
}
