import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  readingLog: {
    findMany: vi.fn(),
  },
  libraryEntry: {
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  review: {
    count: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

import { currentStreak, getProfileStats, today } from "@/lib/stats";

describe("Lesestatistiken und Streak-Berechnung (UC-02, UC-05)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-20T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("berechnet today() als UTC-Mitternacht in der Zeitzone Europe/Istanbul", () => {
    expect(today().toISOString()).toBe("2026-11-20T00:00:00.000Z");

    // 22:00 UTC am 20.11. entspricht 01:00 Uhr am 21.11. in Istanbul (UTC+3)
    vi.setSystemTime(new Date("2026-11-20T22:00:00Z"));
    expect(today().toISOString()).toBe("2026-11-21T00:00:00.000Z");
  });

  describe("currentStreak", () => {
    it("zählt aufeinanderfolgende Lesetage inklusive heute", () => {
      expect(currentStreak(["2026-11-18", "2026-11-19", "2026-11-20"])).toBe(3);
    });

    it("hält den Streak aktiv, wenn gestern gelesen wurde und heute noch läuft", () => {
      expect(currentStreak(["2026-11-17", "2026-11-18", "2026-11-19"])).toBe(3);
    });

    it("gibt 0 zurück, wenn weder heute noch gestern gelesen wurde", () => {
      expect(currentStreak(["2026-11-15", "2026-11-18"])).toBe(0);
      expect(currentStreak([])).toBe(0);
    });

    it("ignoriert doppelte Tage", () => {
      expect(currentStreak(["2026-11-19", "2026-11-20", "2026-11-20"])).toBe(2);
    });
  });

  it("aggregiert Profilstatistiken inklusive aktuellem Streak", async () => {
    prismaMock.libraryEntry.groupBy.mockResolvedValue([
      { status: "READ", _count: 7 },
      { status: "READING", _count: 2 },
    ]);
    prismaMock.libraryEntry.count.mockResolvedValue(4);
    prismaMock.review.count.mockResolvedValue(3);
    prismaMock.readingLog.findMany.mockResolvedValue([
      { date: new Date("2026-11-19T00:00:00Z") },
      { date: new Date("2026-11-20T00:00:00Z") },
    ]);

    const stats = await getProfileStats("user_1");
    expect(stats).toEqual({
      read: 7,
      reading: 2,
      wantToRead: 0,
      readThisYear: 4,
      reviews: 3,
      streak: 2,
    });
  });
});
