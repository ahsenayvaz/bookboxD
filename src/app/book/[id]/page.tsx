import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Avatar } from "@/components/Avatar";
import { BookCover } from "@/components/BookCover";
import { Stars } from "@/components/Stars";
import { StatusButtons } from "@/components/StatusButtons";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getBook } from "@/lib/openlibrary";

export async function generateMetadata({ params }: PageProps<"/book/[id]">): Promise<Metadata> {
  const book = await getBook((await params).id).catch(() => null);
  if (!book) return { title: "Buch" };
  return {
    title: book.authors[0] ? `${book.title} von ${book.authors[0]}` : book.title,
    description: book.description?.slice(0, 160),
  };
}

export default async function BookPage({ params }: PageProps<"/book/[id]">) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  const paragraphs = book.description?.split(/\n\s*\n/).filter(Boolean) ?? [];

  return (
    <div className="relative">
      {/* Unscharfes Cover als warmer Hintergrund */}
      {book.coverId && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-[77px] h-[520px] overflow-hidden">
          <Image
            src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
            alt=""
            fill
            sizes="200px"
            className="scale-125 object-cover opacity-25 blur-3xl sepia"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-cocoa/20 via-cocoa/70 to-cocoa" />
        </div>
      )}

      <div className="relative mx-auto grid max-w-[1040px] gap-10 px-4 pt-10 md:grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr_250px]">
        <div className="mx-auto w-44 motion-safe:animate-fade-up md:mx-0 md:w-full">
          <BookCover
            coverId={book.coverId}
            title={book.title}
            sizes="(min-width: 768px) 220px, 176px"
            priority
            className="shadow-[0_30px_50px_-20px_rgb(0_0_0/0.9),0_0_60px_-20px_rgb(240_160_75/0.35)]"
          />
        </div>

        <section className="min-w-0 motion-safe:animate-fade-up" style={{ animationDelay: "100ms" }}>
          <h1 className="font-serif text-[2.2rem] leading-tight font-semibold text-cream [font-variation-settings:'SOFT'_100,'opsz'_96] sm:text-[2.8rem]">
            {book.title}
          </h1>
          <p className="mt-2 text-lg text-sand">
            {book.authors.length > 0 && (
              <>
                von <span className="font-semibold text-cream">{book.authors.join(", ")}</span>
              </>
            )}
            {book.publishedYear && <span className="ml-2 font-hand text-xl text-tan">({book.publishedYear})</span>}
          </p>

          <div className="mt-7 space-y-4 text-[16px] leading-[1.75] text-sand">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "first-letter:float-left first-letter:mt-1 first-letter:mr-2 first-letter:font-serif first-letter:text-[3.4rem] first-letter:leading-[0.8] first-letter:font-semibold first-letter:text-ember"
                      : undefined
                  }
                >
                  {p}
                </p>
              ))
            ) : (
              <p className="font-hand text-xl text-tan">Zu diesem Buch gibt es noch keine Beschreibung.</p>
            )}
          </div>

          {/* Details wie auf einer Bibliothekskarte */}
          <dl className="paper mt-10 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 p-6 text-sm">
            <dt className="font-serif text-ink-soft italic">Seitenzahl</dt>
            <dd className="border-b border-dotted border-ink/25 text-right text-ink">
              {book.pageCount ? `${book.pageCount} Seiten` : "–"}
            </dd>
            <dt className="font-serif text-ink-soft italic">Erstveröffentlichung</dt>
            <dd className="border-b border-dotted border-ink/25 text-right text-ink">{book.publishedYear ?? "–"}</dd>
            <dt className="font-serif text-ink-soft italic">Quelle</dt>
            <dd className="border-b border-dotted border-ink/25 text-right">
              <a
                href={`https://openlibrary.org/works/${book.olid}`}
                target="_blank"
                rel="noreferrer"
                className="text-terracotta-deep hover:underline"
              >
                Open Library ↗
              </a>
            </dd>
          </dl>

          {book.subjects.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {book.subjects.map((s) => (
                <li key={s} className="rounded-full border border-line bg-walnut/70 px-3 py-1 text-xs text-tan">
                  {s}
                </li>
              ))}
            </ul>
          )}

          <h2 className="ornament-heading mt-14">Rezensionen</h2>
          <Suspense fallback={<p className="text-dusk">Rezensionen werden geladen …</p>}>
            <Reviews olid={book.olid} />
          </Suspense>
        </section>

        <aside
          className="space-y-6 motion-safe:animate-fade-up md:col-start-2 lg:col-start-3 lg:row-start-1"
          style={{ animationDelay: "200ms" }}
        >
          <div className="paper overflow-hidden">
            <Suspense fallback={<div className="h-[92px]" />}>
              <LibraryPanel olid={book.olid} />
            </Suspense>
          </div>
          <div className="rounded-xl border border-line bg-walnut/60 p-5">
            <h2 className="font-serif text-lg font-semibold text-cream italic">Bewertungen</h2>
            <Suspense fallback={<div className="h-12" />}>
              <CommunityRating olid={book.olid} />
            </Suspense>
          </div>
        </aside>
      </div>
    </div>
  );
}

async function LibraryPanel({ olid }: { olid: string }) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="p-5 text-center">
        <p className="font-hand text-xl text-terracotta-deep">Gefällt dir das Buch?</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Melde dich an, um es in dein Regal zu stellen, zu bewerten oder zu rezensieren.
        </p>
        <Link href="/login" className="btn-primary mt-4 w-full">
          Anmelden
        </Link>
      </div>
    );
  }

  const entry = await prisma.libraryEntry.findFirst({
    where: { userId: user.id, book: { olid } },
    select: { status: true },
  });
  return <StatusButtons olid={olid} status={entry?.status ?? null} />;
}

async function CommunityRating({ olid }: { olid: string }) {
  const [ratings, readers] = await Promise.all([
    prisma.libraryEntry.aggregate({
      where: { book: { olid }, rating: { not: null } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.libraryEntry.count({ where: { book: { olid }, status: "READ" } }),
  ]);
  const average = ratings._avg.rating;

  return (
    <div className="mt-3">
      {average ? (
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-4xl font-semibold text-cream">
            {average.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
          <Stars value={average} className="text-lg" />
        </div>
      ) : (
        <p className="text-sm text-tan">Noch hat niemand dieses Buch bewertet.</p>
      )}
      <p className="mt-2 text-xs text-dusk">
        {ratings._count.rating} {ratings._count.rating === 1 ? "Bewertung" : "Bewertungen"} · {readers}× gelesen
      </p>
    </div>
  );
}

async function Reviews({ olid }: { olid: string }) {
  const reviews = await prisma.review.findMany({
    where: { book: { olid }, published: true },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      body: true,
      createdAt: true,
      user: {
        select: {
          username: true,
          avatarUrl: true,
          library: { where: { book: { olid } }, select: { rating: true } },
        },
      },
    },
  });

  if (reviews.length === 0) {
    return (
      <p className="font-hand text-xl text-tan">
        Noch keine Rezensionen – vielleicht schreibst du ja die erste?
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map(({ id, body, createdAt, user }) => {
        const rating = user.library[0]?.rating;
        return (
          <li key={id} className="paper flex gap-4 p-5">
            <Link href={`/u/${user.username}`} className="shrink-0">
              <Avatar src={user.avatarUrl} size={40} alt={user.username} />
            </Link>
            <div className="min-w-0">
              <p className="text-xs text-ink-soft">
                <Link href={`/u/${user.username}`} className="font-semibold text-ink hover:text-terracotta-deep">
                  {user.username}
                </Link>
                {rating && <Stars value={rating} className="ml-2 text-xs" />}
                <span className="ml-2">{createdAt.toLocaleDateString("de-DE")}</span>
              </p>
              <p className="mt-2 font-serif leading-relaxed whitespace-pre-line text-ink">{body}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
