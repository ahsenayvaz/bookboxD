import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Shelf } from "@/components/Shelf";
import type { ReadingStatus } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getProfileStats } from "@/lib/stats";

export async function generateMetadata({ params }: PageProps<"/u/[username]">): Promise<Metadata> {
  return { title: `Profil von ${(await params).username}` };
}

function getShelf(userId: string, status: ReadingStatus) {
  return prisma.libraryEntry.findMany({
    where: { userId, status },
    orderBy: { updatedAt: "desc" },
    take: 6,
    select: { book: { select: { olid: true, title: true, coverId: true, publishedYear: true } } },
  });
}

export default async function ProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  const profile = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, username: true, bio: true, avatarUrl: true, createdAt: true },
  });
  if (!profile) notFound();

  const [viewer, stats, reading, read, wantToRead] = await Promise.all([
    getCurrentUser(),
    getProfileStats(profile.id),
    getShelf(profile.id, "READING"),
    getShelf(profile.id, "READ"),
    getShelf(profile.id, "WANT_TO_READ"),
  ]);
  const isOwn = viewer?.id === profile.id;

  const statItems = [
    [stats.read, "gelesen"],
    [stats.readThisYear, "dieses Jahr"],
    [stats.wantToRead, "auf der Wunschliste"],
    [stats.reviews, "Rezensionen"],
    [stats.streak, "Tage Streak"],
  ] as const;

  const shelves = [
    { title: "Lese ich gerade", entries: reading, empty: "Gerade liegt kein Buch auf dem Nachttisch." },
    { title: "Zuletzt gelesen", entries: read, empty: "Dieses Regal wartet noch auf sein erstes Buch." },
    { title: "Will ich lesen", entries: wantToRead, empty: "Die Wunschliste ist noch leer." },
  ];

  return (
    <div className="mx-auto max-w-[1040px] px-4 pt-10">
      {/* Leseausweis */}
      <section className="paper relative overflow-hidden p-6 motion-safe:animate-fade-up sm:p-8">
        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-terracotta px-6 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-cream uppercase sm:px-8">
          <span>Leseausweis · BookBoxD</span>
          <span className="tabular-nums">Nr. {profile.id.slice(-6).toUpperCase()}</span>
        </div>

        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <Avatar src={profile.avatarUrl} size={104} alt={`Profilbild von ${profile.username}`} />
            <div className="min-w-0">
              <h1 className="truncate font-serif text-3xl font-semibold text-ink [font-variation-settings:'SOFT'_100]">
                {profile.username}
              </h1>
              {profile.bio && (
                <p className="mt-1.5 max-w-md leading-relaxed whitespace-pre-line text-ink-soft">{profile.bio}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {/* Stempel */}
                <span className="inline-block -rotate-3 rounded border-2 border-terracotta/70 px-2 py-0.5 text-[11px] font-bold tracking-wider text-terracotta/80 uppercase">
                  Mitglied seit {profile.createdAt.toLocaleDateString("de-DE", { month: "short", year: "numeric" })}
                </span>
                {isOwn && (
                  <Link href="/settings" className="btn-ghost-ink px-3.5 py-1.5 text-xs">
                    Profil bearbeiten
                  </Link>
                )}
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-5 divide-x divide-dashed divide-ink/20 text-center">
            {statItems.map(([value, label]) => (
              <div key={label} className="flex flex-col-reverse px-3 sm:px-4">
                <dt className="mt-1 text-[11px] leading-tight text-ink-soft">{label}</dt>
                <dd className="font-serif text-3xl font-semibold text-ink">{value.toLocaleString("de-DE")}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {shelves.map(({ title, entries, empty }, i) => (
        <section
          key={title}
          className="mt-14 motion-safe:animate-fade-up"
          style={{ animationDelay: `${150 + i * 100}ms` }}
        >
          <h2 className="ornament-heading">{title}</h2>
          {entries.length > 0 ? (
            <Shelf books={entries.map((e) => e.book)} />
          ) : (
            <div>
              <p className="px-3 pb-4 font-hand text-xl text-tan">
                {empty}{" "}
                {isOwn && (
                  <Link href="/search" className="text-ember hover:text-honey">
                    Bücher entdecken →
                  </Link>
                )}
              </p>
              <div className="shelf-plank" aria-hidden />
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
