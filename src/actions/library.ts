"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ReadingStatus } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getBook } from "@/lib/openlibrary";

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

  await prisma.libraryEntry.upsert({
    where: { userId_bookId: { userId: user.id, bookId: book.id } },
    create: { userId: user.id, bookId: book.id, status },
    update: { status },
  });

  refresh();
}
