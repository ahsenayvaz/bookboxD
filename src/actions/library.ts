"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ReadingStatus } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getBook } from "@/lib/openlibrary";

// Buch einer Leseliste zuordnen (status) oder aus der Bibliothek entfernen (null)
export async function setReadingStatus(olid: string, status: ReadingStatus | null) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (status !== null && !Object.values(ReadingStatus).includes(status)) return;

  if (status === null) {
    await prisma.libraryEntry.deleteMany({ where: { userId: user.id, book: { olid } } });
  } else {
    const details = await getBook(olid);
    if (!details) return;

    const snapshot = {
      title: details.title,
      authors: details.authors,
      coverId: details.coverId,
      pageCount: details.pageCount,
      publishedYear: details.publishedYear,
    };
    const book = await prisma.book.upsert({
      where: { olid },
      create: { olid, ...snapshot },
      update: snapshot,
    });
    await prisma.libraryEntry.upsert({
      where: { userId_bookId: { userId: user.id, bookId: book.id } },
      create: { userId: user.id, bookId: book.id, status },
      update: { status },
    });
  }

  refresh();
}
