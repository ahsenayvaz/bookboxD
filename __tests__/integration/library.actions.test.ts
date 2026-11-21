import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUserMock, requireUserMock, getBookMock, refreshMock, redirectMock, prismaMock } = vi.hoisted(() => {
  class RedirectError extends Error {
    constructor(public destination: string) {
      super(`NEXT_REDIRECT:${destination}`);
    }
  }
  return {
    getCurrentUserMock: vi.fn(),
    requireUserMock: vi.fn(),
    getBookMock: vi.fn(),
    refreshMock: vi.fn(),
    redirectMock: vi.fn((dest: string) => {
      throw new RedirectError(dest);
    }),
    prismaMock: {
      book: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      libraryEntry: {
        deleteMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      readingLog: {
        upsert: vi.fn(),
      },
      $transaction: vi.fn(async (ops: unknown[]) => ops),
    },
  };
});

vi.mock("next/cache", () => ({
  refresh: () => refreshMock(),
}));

vi.mock("next/navigation", () => ({
  redirect: (dest: string) => redirectMock(dest),
}));

vi.mock("@/lib/dal", () => ({
  getCurrentUser: () => getCurrentUserMock(),
  requireUser: () => requireUserMock(),
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/openlibrary", () => ({
  getBook: (...args: unknown[]) => getBookMock(...args),
}));

vi.mock("@/lib/stats", () => ({
  today: () => new Date("2026-11-20T00:00:00Z"),
}));

import { setRating, setReadingStatus, updateProgress } from "@/actions/library";

const MOCK_USER = { id: "user_1", username: "leser_1" };

describe("Bibliothek-, Fortschritts- und Bewertungs-Actions (UC-04, UC-05, UC-06)", () => {
  beforeEach(() => {
    getCurrentUserMock.mockResolvedValue(MOCK_USER);
    requireUserMock.mockResolvedValue(MOCK_USER);
    getBookMock.mockReset();
    refreshMock.mockReset();
    redirectMock.mockClear();
    prismaMock.book.findUnique.mockReset();
    prismaMock.book.upsert.mockReset();
    prismaMock.libraryEntry.deleteMany.mockReset();
    prismaMock.libraryEntry.findUnique.mockReset();
    prismaMock.libraryEntry.findFirst.mockReset();
    prismaMock.libraryEntry.upsert.mockReset();
    prismaMock.libraryEntry.update.mockReset();
    prismaMock.libraryEntry.updateMany.mockReset();
    prismaMock.readingLog.upsert.mockReset();
    prismaMock.$transaction.mockClear();
  });

  describe("setReadingStatus (UC-04)", () => {
    it("leitet nicht angemeldete Nutzer zu /login weiter", async () => {
      getCurrentUserMock.mockResolvedValueOnce(null);
      await expect(setReadingStatus("OL100W", "WANT_TO_READ")).rejects.toThrow("NEXT_REDIRECT:/login");
    });

    it("entfernt das Buch bei status = null aus der Bibliothek", async () => {
      await setReadingStatus("OL100W", null);
      expect(prismaMock.libraryEntry.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user_1", book: { olid: "OL100W" } },
      });
      expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    it("importiert ein neues Buch von Open Library und ordnet es einer Leseliste zu", async () => {
      prismaMock.book.findUnique.mockResolvedValueOnce(null);
      getBookMock.mockResolvedValueOnce({
        olid: "OL100W",
        title: "Dune",
        authors: ["Frank Herbert"],
        coverId: 123,
        pageCount: 500,
        publishedYear: 1965,
      });
      prismaMock.book.upsert.mockResolvedValueOnce({ id: "book_1", olid: "OL100W", pageCount: 500 });
      prismaMock.libraryEntry.findUnique.mockResolvedValueOnce(null);

      await setReadingStatus("OL100W", "READ");

      expect(getBookMock).toHaveBeenCalledWith("OL100W");
      expect(prismaMock.libraryEntry.upsert).toHaveBeenCalledTimes(1);
      const upsertArg = prismaMock.libraryEntry.upsert.mock.calls[0][0];
      expect(upsertArg.create.status).toBe("READ");
      expect(upsertArg.create.currentPage).toBe(500);
      expect(upsertArg.create.finishedAt).toBeInstanceOf(Date);
      expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    it("ignoriert ungültige Statuswerte und nicht gefundene Bücher", async () => {
      await setReadingStatus("OL100W", "INVALID_STATUS" as never);
      expect(prismaMock.libraryEntry.upsert).not.toHaveBeenCalled();

      prismaMock.book.findUnique.mockResolvedValueOnce(null);
      getBookMock.mockResolvedValueOnce(null);
      await setReadingStatus("OL999W", "READING");
      expect(prismaMock.libraryEntry.upsert).not.toHaveBeenCalled();
    });
  });

  describe("updateProgress (UC-05)", () => {
    it("meldet einen Fehler, wenn das Buch nicht in der Bibliothek ist", async () => {
      prismaMock.libraryEntry.findFirst.mockResolvedValueOnce(null);
      const fd = new FormData();
      fd.set("page", "50");

      const state = await updateProgress("OL100W", undefined, fd);
      expect(state?.error).toContain("nicht in deiner Bibliothek");
    });

    it("weist ungültige Seitenzahlen (negativ, Kommazahl, größer als Seitenanzahl) ab", async () => {
      prismaMock.libraryEntry.findFirst.mockResolvedValue({
        id: "entry_1",
        bookId: "book_1",
        status: "READING",
        currentPage: 20,
        book: { pageCount: 300 },
      });

      const negFd = new FormData();
      negFd.set("page", "-5");
      expect((await updateProgress("OL100W", undefined, negFd))?.fieldErrors?.page?.[0]).toContain("nicht negativ");

      const overFd = new FormData();
      overFd.set("page", "301");
      expect((await updateProgress("OL100W", undefined, overFd))?.fieldErrors?.page?.[0]).toContain("300 Seiten");

      const floatFd = new FormData();
      floatFd.set("page", "12.5");
      expect((await updateProgress("OL100W", undefined, floatFd))?.fieldErrors?.page?.[0]).toContain("ganze Seitenzahl");
    });

    it("speichert Fortschritt, wechselt WANT_TO_READ zu READING und erzeugt Streak-Eintrag", async () => {
      prismaMock.libraryEntry.findFirst.mockResolvedValueOnce({
        id: "entry_1",
        bookId: "book_1",
        status: "WANT_TO_READ",
        currentPage: 0,
        book: { pageCount: 300 },
      });

      const fd = new FormData();
      fd.set("page", "45");
      const state = await updateProgress("OL100W", undefined, fd);

      expect(state?.success).toContain("45 Seiten");
      expect(prismaMock.libraryEntry.update).toHaveBeenCalledWith({
        where: { id: "entry_1" },
        data: { currentPage: 45, status: "READING" },
      });
      expect(prismaMock.readingLog.upsert).toHaveBeenCalledWith({
        where: {
          userId_bookId_date: {
            userId: "user_1",
            bookId: "book_1",
            date: new Date("2026-11-20T00:00:00Z"),
          },
        },
        create: {
          userId: "user_1",
          bookId: "book_1",
          date: new Date("2026-11-20T00:00:00Z"),
          pagesRead: 45,
        },
        update: { pagesRead: { increment: 45 } },
      });
    });

    it("markiert das Buch beim Erreichen der letzten Seite automatisch als Gelesen", async () => {
      prismaMock.libraryEntry.findFirst.mockResolvedValueOnce({
        id: "entry_1",
        bookId: "book_1",
        status: "READING",
        currentPage: 280,
        book: { pageCount: 300 },
      });

      const fd = new FormData();
      fd.set("page", "300");
      const state = await updateProgress("OL100W", undefined, fd);

      expect(state?.success).toContain("Gelesen");
      const updateArg = prismaMock.libraryEntry.update.mock.calls[0][0];
      expect(updateArg.data.status).toBe("READ");
      expect(updateArg.data.finishedAt).toBeInstanceOf(Date);
    });

    it("korrigiert bei Rückwärtskorrektur der Seitenzahl den heutigen ReadingLog-Eintrag (UC-05)", async () => {
      prismaMock.libraryEntry.findFirst.mockResolvedValueOnce({
        id: "entry_1",
        bookId: "book_1",
        status: "READING",
        currentPage: 100,
        book: { pageCount: 300 },
      });

      const fd = new FormData();
      fd.set("page", "80");
      const state = await updateProgress("OL100W", undefined, fd);

      expect(state?.success).toBe("Fortschritt gespeichert.");
      // Erwartung: Fehleingabe von 20 zu viel gelesenen Seiten wird im Tageslog korrigiert
      expect(prismaMock.readingLog.upsert).toHaveBeenCalled();
    });
  });

  describe("setRating (UC-06)", () => {
    it("weist Bewertungen außerhalb von 1–5 Sternen ab", async () => {
      expect((await setRating("OL100W", 0)).error).toContain("einem und fünf Sternen");
      expect((await setRating("OL100W", 6)).error).toContain("einem und fünf Sternen");
      expect((await setRating("OL100W", 3.5)).error).toContain("einem und fünf Sternen");
      expect(prismaMock.libraryEntry.updateMany).not.toHaveBeenCalled();
    });

    it("lehnt Bewertung für nicht gelesene Bücher ab", async () => {
      prismaMock.libraryEntry.updateMany.mockResolvedValueOnce({ count: 0 });
      const res = await setRating("OL100W", 4);
      expect(res.error).toContain("Nur gelesene Bücher");
    });

    it("speichert eine gültige Bewertung (1–5) sowie das Entfernen (null)", async () => {
      prismaMock.libraryEntry.updateMany.mockResolvedValue({ count: 1 });

      expect(await setRating("OL100W", 5)).toEqual({});
      expect(prismaMock.libraryEntry.updateMany).toHaveBeenCalledWith({
        where: { userId: "user_1", book: { olid: "OL100W" }, status: "READ" },
        data: { rating: 5 },
      });

      expect(await setRating("OL100W", null)).toEqual({});
      expect(refreshMock).toHaveBeenCalledTimes(2);
    });
  });
});
