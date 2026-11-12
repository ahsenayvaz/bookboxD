import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { BookCover } from "@/components/BookCover";
import { Loading } from "@/components/Loading";
import { PAGE_SIZE, searchBooks, type SearchType } from "@/lib/openlibrary";

export const metadata: Metadata = { title: "Bücher suchen" };

const TYPES: { value: SearchType; label: string }[] = [
  { value: "all", label: "Alles" },
  { value: "title", label: "Titel" },
  { value: "author", label: "Autor" },
];
const MAX_PAGE = 50;

function searchHref(q: string, type: SearchType, page = 1) {
  const params = new URLSearchParams({ q });
  if (type !== "all") params.set("type", type);
  if (page > 1) params.set("page", String(page));
  return `/search?${params}`;
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const type = TYPES.find((t) => t.value === params.type)?.value ?? "all";
  const page = Math.min(MAX_PAGE, Math.max(1, Number(params.page) || 1));

  return (
    <div className="mx-auto max-w-[880px] px-4 pt-10">
      <div className="text-center motion-safe:animate-fade-up">
        <p className="font-hand text-2xl text-ember">Was möchtest du als Nächstes lesen?</p>
        <h1 className="font-serif text-4xl font-semibold text-cream [font-variation-settings:'SOFT'_100]">
          Im Katalog stöbern
        </h1>
      </div>

      {/* Suchleiste wie eine Schublade im Zettelkatalog */}
      <div className="mt-8 rounded-2xl border border-line bg-walnut/80 p-2 shadow-[inset_0_2px_8px_rgb(0_0_0/0.4),0_20px_40px_-25px_rgb(0_0_0/0.9)]">
        <Form action="/search" role="search" className="flex gap-2">
          <label htmlFor="q" className="sr-only">
            Titel oder Autor
          </label>
          <input
            key={q}
            id="q"
            name="q"
            type="search"
            required
            defaultValue={q}
            placeholder="Titel oder Autor, z. B. „Sabahattin Ali“"
            className="h-12 w-full rounded-xl bg-parchment px-4 text-base text-ink shadow-[inset_0_1px_3px_rgb(0_0_0/0.15)] outline-none placeholder:text-ink-soft/50 focus:ring-2 focus:ring-ember/60"
          />
          {type !== "all" && <input type="hidden" name="type" value={type} />}
          <button type="submit" className="btn-primary h-12 shrink-0 rounded-xl px-6">
            Suchen
          </button>
        </Form>
      </div>

      {/* Reiter wie bei Karteikarten */}
      <nav aria-label="Suchen nach" className="mt-6 flex gap-1.5 border-b border-line">
        {TYPES.map((t) => {
          const active = t.value === type;
          return (
            <Link
              key={t.value}
              href={q ? searchHref(q, t.value) : `/search?type=${t.value}`}
              aria-current={active ? "true" : undefined}
              className={`-mb-px rounded-t-lg border border-b-0 px-5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "border-parchment-deep bg-parchment text-ink"
                  : "border-transparent text-tan hover:bg-walnut hover:text-cream"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <section aria-live="polite" className="mt-6">
        {q ? (
          // Neuer key je Suche → Ladeanzeige erscheint bei jeder Anfrage
          <Suspense key={`${type}|${q}|${page}`} fallback={<Loading label="Wir durchsuchen die Regale …" />}>
            <Results q={q} type={type} page={page} />
          </Suspense>
        ) : (
          <p className="py-14 text-center font-hand text-2xl text-tan">
            Gib einen Titel oder Autor ein – wir suchen im ganzen Regal.
          </p>
        )}
      </section>
    </div>
  );
}

async function Results({ q, type, page }: { q: string; type: SearchType; page: number }) {
  let result: Awaited<ReturnType<typeof searchBooks>>;
  try {
    result = await searchBooks(q, type, page);
  } catch {
    return (
      <p className="paper p-5 text-center">
        Der Buchdienst macht gerade eine kleine Pause. Bitte versuche es in ein paar Sekunden noch einmal.
      </p>
    );
  }

  const { total, books } = result;
  if (books.length === 0) {
    return (
      <p className="py-14 text-center font-hand text-2xl text-tan">
        Zu „{q}“ haben wir leider nichts gefunden.
      </p>
    );
  }

  const lastPage = Math.min(MAX_PAGE, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <p className="mb-3 text-sm text-dusk">
        {total.toLocaleString("de-DE")} Treffer für „<span className="text-sand">{q}</span>“
      </p>
      <ul className="space-y-1">
        {books.map((book, i) => (
          <li
            key={book.olid}
            className="motion-safe:animate-fade-up"
            style={{ animationDelay: `${Math.min(i, 10) * 45}ms` }}
          >
            <Link
              href={`/book/${book.olid}`}
              className="group flex gap-5 rounded-xl p-3 transition-colors duration-300 hover:bg-walnut/80"
            >
              <div className="w-[68px] shrink-0">
                <BookCover coverId={book.coverId} title={book.title} size="M" sizes="68px" />
              </div>
              <div className="min-w-0 self-center">
                <h2 className="font-serif text-xl leading-snug font-semibold text-cream transition-colors group-hover:text-ember">
                  {book.title}
                </h2>
                {book.authors.length > 0 && <p className="mt-1 text-sand">von {book.authors.join(", ")}</p>}
                <p className="mt-1 text-xs text-dusk">
                  {[book.publishedYear, book.pageCount && `${book.pageCount} Seiten`].filter(Boolean).join(" · ")}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {lastPage > 1 && (
        <nav aria-label="Seiten" className="mt-8 flex items-center justify-between">
          {page > 1 ? (
            <Link href={searchHref(q, type, page - 1)} className="btn-ghost">
              ← Zurückblättern
            </Link>
          ) : (
            <span />
          )}
          <span className="font-hand text-xl text-tan">
            Seite {page} von {lastPage}
          </span>
          {page < lastPage ? (
            <Link href={searchHref(q, type, page + 1)} className="btn-ghost">
              Weiterblättern →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
