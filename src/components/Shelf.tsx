import Link from "next/link";
import { BookCover } from "./BookCover";

type ShelfBook = { olid: string; title: string; coverId: number | null; publishedYear?: number | null };

// Eine Bücherreihe auf einem Holzbrett; auf kleinen Bildschirmen seitlich scrollbar
export function Shelf({ books }: { books: ShelfBook[] }) {
  return (
    <div>
      <ul className="-mb-1 grid auto-cols-[104px] grid-flow-col gap-4 overflow-x-auto px-3 pt-4 pb-1 sm:auto-cols-[minmax(0,1fr)] sm:grid-flow-row sm:grid-cols-6 sm:overflow-visible">
        {books.map((book, i) => (
          <li
            key={book.olid}
            className="motion-safe:animate-fade-up"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <Link
              href={`/book/${book.olid}`}
              title={book.publishedYear ? `${book.title} (${book.publishedYear})` : book.title}
              className="block"
            >
              <BookCover coverId={book.coverId} title={book.title} sizes="(min-width: 640px) 160px, 104px" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="shelf-plank" aria-hidden />
    </div>
  );
}
