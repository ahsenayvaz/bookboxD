import Link from "next/link";
import { Suspense } from "react";
import { FloatingMotes, ReadingNook } from "@/components/ReadingNook";
import { Shelf } from "@/components/Shelf";
import { getCurrentUser } from "@/lib/dal";
import { getTrendingBooks } from "@/lib/openlibrary";

const FEATURES = [
  ["Leselisten führen", "Ordne Bücher den Regalen „Gelesen“, „Lese ich gerade“ und „Will lesen“ zu.", "M4 5h4v14H4zM10 5h4v14h-4zM16.5 5.5l3.5 1-3.5 13-3.5-1z"],
  ["Bücher bewerten", "Vergib ein bis fünf Sterne und sieh, wie andere ein Buch erlebt haben.", "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"],
  ["Gedanken notieren", "Schreibe Rezensionen und lies, was andere über ihre Lieblingsseiten denken.", "M5 19l1-4L16 5l3 3L9 18zM14 7l3 3"],
  ["Lese-Streak pflegen", "Ein paar Seiten jeden Abend – trag sie ein und sieh zu, wie deine Gewohnheit wächst.", "M12 21c-4 0-6.5-2.6-6.5-6 0-4 3.5-5.5 3.5-9.5 2.5 1.5 3 3.5 3 5 1-1 1.5-2.5 1.5-3.5 2.5 2 4 5 4 8 0 3.4-2.5 6-5.5 6z"],
  ["Leseziel setzen", "Lege fest, wie viele Bücher du dieses Jahr lesen willst, und sieh dein Regal wachsen.", "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-5a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"],
  ["Gleichgesinnte finden", "Folge anderen Lesern und entdecke Menschen mit ähnlichem Geschmack.", "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2.5 19c.5-3 2.8-5 5.5-5s5 2 5.5 5m-2-4.6c1.2-.9 2.7-1.4 4.5-1.4 2.7 0 5 2 5.5 5"],
] as const;

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <FloatingMotes />
        <div className="relative mx-auto grid max-w-[1040px] items-center gap-6 px-4 pt-12 pb-10 md:grid-cols-[1.1fr_0.9fr] md:pt-16">
          <div className="motion-safe:animate-fade-up">
            <p className="inline-block -rotate-2 font-hand text-2xl text-ember">Schnapp dir eine Decke …</p>
            <h1 className="mt-3 font-serif text-[2.4rem] leading-[1.08] font-semibold text-cream [font-variation-settings:'SOFT'_100,'opsz'_96] sm:text-[3.3rem]">
              Dein gemütlicher Ort für jedes Buch, das du je geliebt hast.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-sand">
              Halte fest, was du gelesen hast, merke dir, was du lesen willst, und teile deine Lieblingsseiten mit
              Menschen, die genauso gern lesen wie du.
            </p>
            <Suspense fallback={<div className="h-[52px]" />}>
              <HeroCallToAction />
            </Suspense>
          </div>
          <ReadingNook className="mx-auto w-full max-w-[440px] motion-safe:animate-fade-in" />
        </div>
      </section>

      <div className="mx-auto max-w-[1040px] px-4">
        <section aria-labelledby="trending" className="mt-6">
          <h2 id="trending" className="ornament-heading">
            Gerade gern gelesen
          </h2>
          <Suspense fallback={<ShelfSkeleton />}>
            <TrendingBooks />
          </Suspense>
        </section>

        <figure className="mx-auto my-24 max-w-2xl text-center">
          <span aria-hidden className="block font-serif text-7xl leading-none text-terracotta/60">“</span>
          <blockquote className="-mt-6 font-serif text-2xl leading-snug text-cream italic [font-variation-settings:'SOFT'_100] sm:text-[1.75rem]">
            Ein Zimmer ohne Bücher ist wie ein Körper ohne Seele.
          </blockquote>
          <figcaption className="mt-4 font-hand text-xl text-tan">— Marcus Tullius Cicero</figcaption>
        </figure>

        <section aria-labelledby="features">
          <h2 id="features" className="ornament-heading">
            Was dich hier erwartet
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {FEATURES.map(([title, text, icon], i) => (
              <li
                key={title}
                className={`paper relative overflow-hidden p-6 pt-8 transition-transform duration-500 hover:rotate-0 hover:-translate-y-1 ${
                  i % 2 ? "rotate-[0.8deg]" : "-rotate-[0.8deg]"
                }`}
              >
                {/* rote Kopflinie wie auf einer alten Karteikarte */}
                <span aria-hidden className="absolute inset-x-0 top-4 h-px bg-terracotta/50" />
                <svg viewBox="0 0 24 24" className="mb-3 h-7 w-7 text-terracotta" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
                  <path d={icon} />
                </svg>
                <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 leading-relaxed text-ink-soft">{text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

async function HeroCallToAction() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link href="/search" className="btn-primary px-6 py-3 text-base">
          Nächstes Buch finden
        </Link>
        <p className="font-hand text-2xl text-sand">
          Schön, dass du da bist,{" "}
          <Link href={`/u/${user.username}`} className="text-ember hover:text-honey">
            {user.username}
          </Link>
          !
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <Link href="/register" className="btn-primary px-6 py-3 text-base">
        Mach es dir gemütlich
      </Link>
      <Link href="/search" className="btn-ghost px-6 py-3 text-base">
        Erst mal stöbern
      </Link>
    </div>
  );
}

function ShelfSkeleton() {
  return (
    <div>
      <div className="grid grid-cols-3 gap-4 px-3 pt-4 sm:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded bg-bark/70 max-sm:[&:nth-child(n+4)]:hidden" />
        ))}
      </div>
      <div className="shelf-plank" aria-hidden />
    </div>
  );
}

async function TrendingBooks() {
  const books = await getTrendingBooks();
  if (books.length === 0) {
    return <p className="text-dusk">Die Regale werden gerade neu sortiert – schau gleich noch mal vorbei.</p>;
  }
  return (
    <div className="space-y-10">
      <Shelf books={books.slice(0, 6)} />
      {books.length > 6 && <Shelf books={books.slice(6, 12)} />}
    </div>
  );
}
