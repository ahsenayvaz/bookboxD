import type { Metadata } from "next";
import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { LibraryControls } from "@/components/LibraryControls";
import type { ReadingStatus } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Meine Bibliothek" };

const FILTERS: { value: ReadingStatus | "all"; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "READING", label: "Lese ich gerade" },
  { value: "READ", label: "Gelesen" },
  { value: "WANT_TO_READ", label: "Will lesen" },
];

const SORTS = [
  { value: "updated", label: "Zuletzt geändert" },
  { value: "title", label: "Titel" },
  { value: "rating", label: "Bewertung" },
] as const;
type Sort = (typeof SORTS)[number]["value"];

const ORDER_BY = {
  updated: [{ updatedAt: "desc" }],
  title: [{ book: { title: "asc" } }],
  rating: [{ rating: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
} as const;

function href(status: string, sort: Sort) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (sort !== "updated") params.set("sort", sort);
  const query = params.toString();
  return query ? `/library?${query}` : "/library";
}

// ID-29 / ID-17: Persönliche Bibliothek und Leselisten ansehen und bearbeiten
export default async function LibraryPage({ searchParams }: PageProps<"/library">) {
  const user = await requireUser();
  const params = await searchParams;
  const status = FILTERS.find((f) => f.value === params.status)?.value ?? "all";
  const sort = SORTS.find((s) => s.value === params.sort)?.value ?? "updated";

  const [entries, counts] = await Promise.all([
    prisma.libraryEntry.findMany({
      where: { userId: user.id, ...(status !== "all" && { status }) },
      orderBy: [...ORDER_BY[sort]],
      select: {
        status: true,
        updatedAt: true,
        book: { select: { olid: true, title: true, authors: true, coverId: true } },
      },
    }),
    prisma.libraryEntry.groupBy({ by: ["status"], where: { userId: user.id }, _count: true }),
  ]);

  const countFor = (value: string) =>
    value === "all"
      ? counts.reduce((sum, c) => sum + c._count, 0)
      : (counts.find((c) => c.status === value)?._count ?? 0);

  return (
    <div className="mx-auto max-w-[1040px] px-4 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4 motion-safe:animate-fade-up">
        <div>
          <p className="font-hand text-2xl text-ember">Deine Regale</p>
          <h1 className="font-serif text-4xl font-semibold text-cream [font-variation-settings:'SOFT'_100]">
            Meine Bibliothek
          </h1>
        </div>
        <Link href={`/u/${user.username}`} className="btn-ghost">
          Zum Profil →
        </Link>
      </div>

      <div className="mt-8 max-w-3xl">
        <nav aria-label="Leselisten" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = f.value === status;
            return (
              <Link
                key={f.value}
                href={href(f.value, sort)}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-ember/20 text-cream ring-1 ring-ember/60"
                    : "text-sand ring-1 ring-line hover:bg-bark hover:text-cream"
                }`}
              >
                {f.label}
                <span className="ml-1.5 text-xs font-normal text-tan tabular-nums">{countFor(f.value)}</span>
              </Link>
            );
          })}
        </nav>

        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-dusk">
          Sortieren:
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={href(status, s.value)}
              aria-current={s.value === sort ? "true" : undefined}
              className={s.value === sort ? "font-semibold text-ember" : "text-tan hover:text-cream"}
            >
              {s.label}
            </Link>
          ))}
        </p>

        {entries.length === 0 ? (
          <div className="mt-8">
            <p className="px-3 pb-4 font-hand text-xl text-tan">
              {status === "all" ? "Deine Bibliothek ist noch leer." : "In dieser Liste steht noch kein Buch."}{" "}
              <Link href="/search" className="text-ember hover:text-honey">
                Bücher entdecken →
              </Link>
            </p>
            <div className="shelf-plank" aria-hidden />
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {entries.map(({ book, ...entry }, i) => (
              <li
                key={book.olid}
                className="paper flex gap-4 p-4 motion-safe:animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <Link href={`/book/${book.olid}`} className="w-16 shrink-0 sm:w-20">
                  <BookCover coverId={book.coverId} title={book.title} size="M" sizes="80px" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div>
                    <Link
                      href={`/book/${book.olid}`}
                      className="line-clamp-2 font-serif text-lg leading-snug font-semibold text-ink hover:text-terracotta-deep"
                    >
                      {book.title}
                    </Link>
                    {book.authors.length > 0 && (
                      <p className="truncate text-sm text-ink-soft">{book.authors.join(", ")}</p>
                    )}
                  </div>

                  <div className="mt-auto">
                    <LibraryControls olid={book.olid} title={book.title} status={entry.status} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
