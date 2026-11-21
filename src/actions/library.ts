"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ReadingStatus } from "@/generated/prisma/enums";
import { getCurrentUser, requireUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getBook } from "@/lib/openlibrary";
import { today } from "@/lib/stats";
import type { FormState } from "@/lib/validation";

// Obergrenze, falls Open Library keine Seitenzahl kennt
const MAX_PAGES_FALLBACK = 20000;

// Lokale Kopie des Buches holen – nur beim ersten Kontakt wird Open Library abgefragt (NFA-05)
async function ensureBook(olid: string) {
  const existing = await prisma.book.findUnique({ where: { olid } });
  if (existing) return existing;

  const details = await getBook(olid);
  if (!details) return null;
  return prisma.book.upsert({
    where: { olid },
    create: {
      olid,
      title: details.title,
      authors: details.authors,
      coverId: details.coverId,
      pageCount: details.pageCount,
      publishedYear: details.publishedYear,
    },
    update: {},
  });
}

// ID-17 / ID-29: Buch einer Leseliste zuordnen, zwischen Listen verschieben (status) oder entfernen (null)
export async function setReadingStatus(olid: string, status: ReadingStatus | null) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (status !== null && !Object.values(ReadingStatus).includes(status)) return;

  if (status === null) {
    await prisma.libraryEntry.deleteMany({ where: { userId: user.id, book: { olid } } });
    refresh();
    return;
  }

  const book = await ensureBook(olid);
  if (!book) return;

  const entry = await prisma.libraryEntry.findUnique({
    where: { userId_bookId: { userId: user.id, bookId: book.id } },
    select: { status: true, currentPage: true },
  });

  // „Gelesen“: Abschlussdatum setzen (zählt für die Reading Challenge) und Fortschritt auf 100 %
  const finished =
    status === "READ"
      ? {
          finishedAt: entry?.status === "READ" ? undefined : new Date(),
          currentPage: book.pageCount ?? entry?.currentPage ?? 0,
        }
      : { finishedAt: null };

  await prisma.libraryEntry.upsert({
    where: { userId_bookId: { userId: user.id, bookId: book.id } },
    create: { userId: user.id, bookId: book.id, status, ...finished },
    update: { status, ...finished },
  });

  refresh();
}

// ID-13 / ID-21: Lesefortschritt speichern; neue Seiten zählen für den Lese-Streak des heutigen Tages
export async function updateProgress(olid: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const raw = String(formData.get("page") ?? "").trim();
  const values = { page: raw };

  const entry = await prisma.libraryEntry.findFirst({
    where: { userId: user.id, book: { olid } },
    select: { id: true, bookId: true, status: true, currentPage: true, book: { select: { pageCount: true } } },
  });
  if (!entry) return { error: "Das Buch ist nicht in deiner Bibliothek.", values };

  const max = entry.book.pageCount ?? MAX_PAGES_FALLBACK;
  const parsed = z.coerce
    .number({ error: "Bitte gib eine Seitenzahl ein." })
    .int("Bitte gib eine ganze Seitenzahl ein.")
    .min(0, "Die Seitenzahl darf nicht negativ sein.")
    .max(max, `Das Buch hat nur ${max.toLocaleString("de-DE")} Seiten.`)
    .safeParse(raw === "" ? undefined : raw);
  if (!parsed.success) {
    return { fieldErrors: { page: [parsed.error.issues[0].message] }, values };
  }

  const page = parsed.data;
  const newPages = page - entry.currentPage;
  const finished = entry.book.pageCount !== null && page >= entry.book.pageCount;
  const status: ReadingStatus = finished ? "READ" : entry.status === "WANT_TO_READ" && page > 0 ? "READING" : entry.status;
  const date = today();

  await prisma.$transaction([
    prisma.libraryEntry.update({
      where: { id: entry.id },
      data: {
        currentPage: page,
        status,
        ...(status === "READ" && entry.status !== "READ" ? { finishedAt: new Date() } : {}),
      },
    }),
    ...(newPages > 0
      ? [
          prisma.readingLog.upsert({
            where: { userId_bookId_date: { userId: user.id, bookId: entry.bookId, date } },
            create: { userId: user.id, bookId: entry.bookId, date, pagesRead: newPages },
            update: { pagesRead: { increment: newPages } },
          }),
        ]
      : []),
  ]);

  refresh();
  if (finished && entry.status !== "READ") {
    return { success: "Geschafft! Das Buch steht jetzt im Regal „Gelesen“.", values: { page: String(page) } };
  }
  return {
    success:
      newPages > 0
        ? `Gespeichert – ${newPages.toLocaleString("de-DE")} ${newPages === 1 ? "Seite" : "Seiten"} zählen für deinen Streak.`
        : "Fortschritt gespeichert.",
    values: { page: String(page) },
  };
}

// ID-14: Sternebewertung 1–5 setzen oder entfernen (null) – nur für gelesene Bücher
export async function setRating(olid: string, rating: number | null): Promise<{ error?: string }> {
  const user = await requireUser();
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return { error: "Bitte vergib zwischen einem und fünf Sternen." };
  }

  const { count } = await prisma.libraryEntry.updateMany({
    where: { userId: user.id, book: { olid }, status: "READ" },
    data: { rating },
  });
  if (count === 0) return { error: "Nur gelesene Bücher können bewertet werden." };

  refresh();
  return {};
}
