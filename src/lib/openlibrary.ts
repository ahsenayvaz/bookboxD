import "server-only";
import { cacheLife } from "next/cache";

// Externer Buchdienst: Open Library (https://openlibrary.org/developers/api) – kostenlos, ohne API-Key
const BASE = "https://openlibrary.org";
const HEADERS = { "User-Agent": "BookBoxD/0.1 (https://github.com/ahsenayvaz/bookboxD)" };
// NFA-05: Suchanfragen an den externen Dienst sollen nach spätestens 5 s beantwortet sein
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

export type BookDetails = BookSummary & {
  description: string | null;
  subjects: string[];
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
    // Open Library liefert Autoren teils doppelt (z. B. mehrere Ausgaben)
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

type WorkJson = {
  title: string;
  type?: { key: string };
  location?: string;
  description?: string | { value: string };
  subjects?: string[];
  covers?: number[];
};

function cleanDescription(raw: WorkJson["description"]) {
  const text = typeof raw === "string" ? raw : raw?.value;
  if (!text) return null;
  return (
    text
      // Quellenangaben & Linklisten am Ende abschneiden
      .split(/\r?\n\s*-{3,}/)[0]
      .replace(/\(\[source\]\[\d+\]\)/gi, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^\[\d+\]:.*$/gm, "")
      .trim() || null
  );
}

export async function getBook(olid: string): Promise<BookDetails | null> {
  "use cache";
  cacheLife("days");

  if (!OLID_PATTERN.test(olid)) return null;

  const [workRes, searchRes] = await Promise.all([
    olFetch(`/works/${olid}.json`),
    olFetch(`/search.json?q=key:/works/${olid}&fields=${SEARCH_FIELDS}&limit=1`),
  ]);
  if (workRes.status === 404) return null;
  if (!workRes.ok) throw new Error(`Open Library work failed: ${workRes.status}`);

  const work: WorkJson = await workRes.json();
  // Zusammengeführte Werke verweisen auf eine neue ID
  if (work.type?.key === "/type/redirect" && work.location) {
    return getBook(work.location.replace("/works/", ""));
  }

  const doc: SearchDoc | undefined = searchRes.ok ? (await searchRes.json()).docs?.[0] : undefined;
  const summary = toSummary(doc ?? { key: olid, title: work.title });

  return {
    ...summary,
    title: work.title ?? summary.title,
    coverId: summary.coverId ?? work.covers?.find((id) => id > 0) ?? null,
    description: cleanDescription(work.description),
    subjects: (work.subjects ?? []).filter((s) => s.length <= 32 && !s.includes(":")).slice(0, 8),
  };
}

export async function getTrendingBooks(): Promise<BookSummary[]> {
  "use cache";

  try {
    // Der Trending-Endpunkt ist langsamer als die Suche, daher mehr Zeit
    const res = await olFetch(`/trending/weekly.json?limit=24`, 10_000);
    if (!res.ok) throw new Error(`Open Library trending failed: ${res.status}`);
    const data: { works: SearchDoc[] } = await res.json();
    cacheLife("hours");
    return data.works.filter((w) => w.cover_i).slice(0, 12).map(toSummary);
  } catch {
    // Fehlschlag nur kurz cachen, damit die Regale bald wieder gefüllt werden
    cacheLife("seconds");
    return [];
  }
}
