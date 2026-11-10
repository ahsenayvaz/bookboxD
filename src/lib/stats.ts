import "server-only";
import { prisma } from "./db";

const TIME_ZONE = "Europe/Istanbul";
const DAY_MS = 24 * 60 * 60 * 1000;

// Kalendertag (YYYY-MM-DD) in der Zeitzone der Nutzer
function todayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

// Aufeinanderfolgende Tage mit Leseeintrag. Der Streak gilt als nicht unterbrochen,
// solange gestern gelesen wurde und der heutige Tag noch läuft.
export function currentStreak(days: string[]) {
  const set = new Set(days);
  let cursor = new Date(`${todayKey()}T00:00:00Z`);
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
