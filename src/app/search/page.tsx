import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { Loading } from "@/components/Loading";
import { PAGE_SIZE, searchBooks, type SearchType } from "@/lib/openlibrary";

export const metadata: Metadata = { title: "Bücher suchen" };

const TYPES: { value: SearchType; label: string }[] = [
  { value: "all", label: "Alles" },
  { value: "title", label: "Titel" },
  { value: "author", label: "Autor" },
];

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const type = TYPES.find((t) => t.value === params.type)?.value ?? "all";
  const page = Math.min(50, Math.max(1, Number(params.page) || 1));

  return (
    <div className="mx-auto max-w-[1040px] px-4 pt-10">
      <h1 className="font-serif text-4xl font-semibold text-cream">Bücher suchen</h1>
      <Form action="/search" className="mt-6 flex flex-wrap gap-3">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Buchtitel oder Autor eingeben …"
          className="h-11 flex-1 rounded-lg border border-line bg-walnut px-4 text-cream"
        />
        <select name="type" defaultValue={type} className="h-11 rounded-lg border border-line bg-walnut px-3 text-cream">
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary px-6">
          Suchen
        </button>
      </Form>

      {q && (
        <Suspense key={`${q}:${type}:${page}`} fallback={<Loading label="Suche läuft …" />}>
          <Results q={q} type={type} page={page} />
        </Suspense>
      )}
    </div>
  );
}

async function Results({ q, type, page }: { q: string; type: SearchType; page: number }) {
  const { total, books } = await searchBooks(q, type, page);
  if (books.length === 0) {
    return <p className="mt-10 text-sand">Keine passenden Bücher gefunden.</p>;
  }

  return (
    <div className="mt-8 space-y-4">
      <p className="text-sm text-tan">{total.toLocaleString("de-DE")} Treffer</p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {books.map((b) => (
          <li key={b.olid} className="paper p-4">
            <Link href={`/book/${b.olid}`} className="font-serif text-lg font-semibold text-ink hover:text-terracotta">
              {b.title}
            </Link>
            {b.authors.length > 0 && <p className="text-sm text-ink-soft">{b.authors.join(", ")}</p>}
            <p className="mt-1 text-xs text-ink-soft/70">
              {[b.publishedYear, b.pageCount ? `${b.pageCount} Seiten` : null].filter(Boolean).join(" · ")}
            </p>
          </li>
        ))}
      </ul>
      {total > PAGE_SIZE && (
        <div className="flex gap-3 pt-4">
          {page > 1 && (
            <Link href={`/search?q=${encodeURIComponent(q)}&type=${type}&page=${page - 1}`} className="btn-ghost">
              ← Zurück
            </Link>
          )}
          {page * PAGE_SIZE < total && (
            <Link href={`/search?q=${encodeURIComponent(q)}&type=${type}&page=${page + 1}`} className="btn-ghost">
              Weiter →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
