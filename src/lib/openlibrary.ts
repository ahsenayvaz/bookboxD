import "server-only";
import { cacheLife } from "next/cache";

const BASE = "https://openlibrary.org";
const HEADERS = { "User-Agent": "BookBoxD/0.1 (https://github.com/ahsenayvaz/bookboxD)" };
const TIMEOUT_MS = 5000;

export const PAGE_SIZE = 20;
export const OLID_PATTERN = /^OL\d+W$/;

export type SearchType = "all" | "title" | "author";

export type BookSummary = {
  olid: string;
  title: string;
  authors: string[];
  coverId: number | null;
  publishedYear: number | null;
  pageCount: number | null;
};

type SearchDoc = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  number_of_pages_median?: number;
};

const SEARCH_FIELDS = "key,title,author_name,cover_i,first_publish_year,number_of_pages_median";

async function olFetch(path: string, timeoutMs = TIMEOUT_MS) {
  return fetch(`${BASE}${path}`, { headers: HEADERS, signal: AbortSignal.timeout(timeoutMs) });
}

function toSummary(doc: SearchDoc): BookSummary {
  return {
    olid: doc.key.replace("/works/", ""),
    title: doc.title,
    authors: [...new Set(doc.author_name ?? [])].slice(0, 3),
    coverId: doc.cover_i ?? null,
    publishedYear: doc.first_publish_year ?? null,
    pageCount: doc.number_of_pages_median ?? null,
  };
}

export async function searchBooks(query: string, type: SearchType, page: number) {
  "use cache";
  cacheLife("hours");

  const params = new URLSearchParams({
    fields: SEARCH_FIELDS,
    limit: String(PAGE_SIZE),
    page: String(page),
  });
  params.set(type === "all" ? "q" : type, query);

  const res = await olFetch(`/search.json?${params}`);
  if (!res.ok) throw new Error(`Open Library search failed: ${res.status}`);
  const data: { numFound: number; docs: SearchDoc[] } = await res.json();

  return { total: data.numFound, books: data.docs.map(toSummary) };
}

export async function getTrendingBooks(): Promise<BookSummary[]> {
  "use cache";

  try {
    const res = await olFetch(`/trending/weekly.json?limit=24`, 10_000);
    if (!res.ok) throw new Error(`Open Library trending failed: ${res.status}`);
    const data: { works: SearchDoc[] } = await res.json();
    cacheLife("hours");
    return data.works.filter((w) => w.cover_i).slice(0, 12).map(toSummary);
  } catch {
    cacheLife("seconds");
    return [];
  }
}
