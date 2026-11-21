import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cacheLifeMock = vi.fn();

vi.mock("next/cache", () => ({
  cacheLife: (...args: unknown[]) => cacheLifeMock(...args),
}));

import { getBook, getTrendingBooks, OLID_PATTERN, PAGE_SIZE, searchBooks } from "@/lib/openlibrary";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Open-Library-Anbindung (UC-04, NFA-05)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    cacheLifeMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("validiert OLID-Format korrekt", () => {
    expect(OLID_PATTERN.test("OL1019598W")).toBe(true);
    expect(OLID_PATTERN.test("OL42W")).toBe(true);
    expect(OLID_PATTERN.test("OL123A")).toBe(false);
    expect(OLID_PATTERN.test("../etc/passwd")).toBe(false);
    expect(PAGE_SIZE).toBe(20);
  });

  describe("searchBooks", () => {
    it("sendet den gewählten Suchfilter (all/title/author) und dedupliziert Autoren", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          numFound: 42,
          docs: [
            {
              key: "/works/OL123W",
              title: "Der Prozess",
              author_name: ["Franz Kafka", "Franz Kafka", "Max Brod", "Autor 3", "Autor 4"],
              cover_i: 999,
              first_publish_year: 1925,
              number_of_pages_median: 256,
            },
          ],
        }),
      );

      const res = await searchBooks("Kafka", "author", 2);
      const calledUrl = String(fetchMock.mock.calls[0][0]);
      expect(calledUrl).toContain("author=Kafka");
      expect(calledUrl).toContain("page=2");
      expect(calledUrl).toContain("limit=20");
      expect(cacheLifeMock).toHaveBeenCalledWith("hours");
      expect(res).toEqual({
        total: 42,
        books: [
          {
            olid: "OL123W",
            title: "Der Prozess",
            authors: ["Franz Kafka", "Max Brod", "Autor 3"],
            coverId: 999,
            publishedYear: 1925,
            pageCount: 256,
          },
        ],
      });
    });

    it("verwendet Parameter q für Filter 'all' und wirft bei HTTP-Fehler", async () => {
      fetchMock.mockResolvedValueOnce(new Response("Service Unavailable", { status: 503 }));
      await expect(searchBooks("Dune", "all", 1)).rejects.toThrow("Open Library search failed: 503");
      expect(String(fetchMock.mock.calls[0][0])).toContain("q=Dune");
    });
  });

  describe("getBook", () => {
    it("gibt null für ungültige OLIDs zurück ohne Netzwerkaufruf", async () => {
      expect(await getBook("ungueltig")).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("gibt null bei 404 zurück und wirft bei Serverfehlern", async () => {
      fetchMock
        .mockResolvedValueOnce(new Response("Not Found", { status: 404 }))
        .mockResolvedValueOnce(jsonResponse({ docs: [] }));
      expect(await getBook("OL999999W")).toBeNull();

      fetchMock
        .mockResolvedValueOnce(new Response("Bad Gateway", { status: 502 }))
        .mockResolvedValueOnce(jsonResponse({ docs: [] }));
      await expect(getBook("OL123W")).rejects.toThrow("Open Library work failed: 502");
    });

    it("bereinigt Beschreibungen, filtert Subjects und nutzt Fallback-Cover", async () => {
      fetchMock
        .mockResolvedValueOnce(
          jsonResponse({
            title: "Die Verwandlung",
            description: {
              value:
                "Gregor Samsa erwacht ([source][1]) als [Ungeziefer](https://example.org).\n---\n[1]: https://example.org",
            },
            covers: [-1, 555],
            subjects: ["Klassiker", "nyt:bestseller", "Ein viel zu langes Thema ueber zweiunddreissig Zeichen", "Literatur"],
          }),
        )
        .mockResolvedValueOnce(
          jsonResponse({
            docs: [{ key: "/works/OL100W", title: "Die Verwandlung", author_name: ["Franz Kafka"] }],
          }),
        );

      const book = await getBook("OL100W");
      expect(book).toEqual({
        olid: "OL100W",
        title: "Die Verwandlung",
        authors: ["Franz Kafka"],
        coverId: 555,
        publishedYear: null,
        pageCount: null,
        description: "Gregor Samsa erwacht  als Ungeziefer.",
        subjects: ["Klassiker", "Literatur"],
      });
    });

    it("bricht zyklische Open-Library-Weiterleitungen nach höchstens 3 Sprüngen ab (NFA-05)", async () => {
      let hops = 0;
      fetchMock.mockImplementation(async (url: string) => {
        if (String(url).includes("/works/")) {
          hops++;
          if (hops > 8) return new Response("Not Found", { status: 404 });
          const next = hops % 2 === 1 ? "/works/OL200W" : "/works/OL100W";
          return jsonResponse({ type: { key: "/type/redirect" }, location: next });
        }
        return jsonResponse({ docs: [] });
      });

      const book = await getBook("OL100W");
      expect(book).toBeNull();
      expect(hops).toBeLessThanOrEqual(3);
    });

    it("folgt Open-Library-Weiterleitungen auf zusammengeführte Werke", async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ type: { key: "/type/redirect" }, location: "/works/OL200W" }))
        .mockResolvedValueOnce(jsonResponse({ docs: [] }))
        .mockResolvedValueOnce(jsonResponse({ title: "Zielwerk", description: "Kurzbeschreibung." }))
        .mockResolvedValueOnce(jsonResponse({ docs: [{ key: "/works/OL200W", title: "Zielwerk" }] }));

      const book = await getBook("OL100W");
      expect(book?.olid).toBe("OL200W");
      expect(book?.title).toBe("Zielwerk");
      expect(book?.description).toBe("Kurzbeschreibung.");
    });
  });

  describe("getTrendingBooks", () => {
    it("filtert Bücher ohne Cover heraus und begrenzt auf 12 Einträge", async () => {
      const works = Array.from({ length: 15 }, (_, i) => ({
        key: `/works/OL${i + 1}W`,
        title: `Buch ${i + 1}`,
        cover_i: i === 0 ? undefined : 1000 + i,
      }));
      fetchMock.mockResolvedValueOnce(jsonResponse({ works }));

      const books = await getTrendingBooks();
      expect(books).toHaveLength(12);
      expect(books[0].olid).toBe("OL2W");
      expect(cacheLifeMock).toHaveBeenCalledWith("hours");
    });

    it("liefert bei Ausfall des Buchdienstes ein leeres Array und verkürzt die Cache-Dauer", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network timeout"));
      const books = await getTrendingBooks();
      expect(books).toEqual([]);
      expect(cacheLifeMock).toHaveBeenCalledWith("seconds");
    });
  });
});
