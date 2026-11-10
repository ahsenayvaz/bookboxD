import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getProfileStats } from "@/lib/stats";

export async function generateMetadata({ params }: PageProps<"/u/[username]">): Promise<Metadata> {
  return { title: `Profil von ${(await params).username}` };
}

export default async function ProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  const profile = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, username: true, bio: true, avatarUrl: true, createdAt: true },
  });
  if (!profile) notFound();

  const [viewer, stats] = await Promise.all([
    getCurrentUser(),
    getProfileStats(profile.id),
  ]);
  const isOwner = viewer?.id === profile.id;

  return (
    <div className="mx-auto max-w-[1040px] px-4 pt-10">
      <section className="paper p-6 sm:p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <Avatar src={profile.avatarUrl} size={96} alt={`Profilbild von ${profile.username}`} />
          <div className="flex-1">
            <h1 className="font-serif text-3xl font-semibold text-ink">{profile.username}</h1>
            {profile.bio && <p className="mt-2 max-w-xl text-ink-soft">{profile.bio}</p>}
          </div>
          {isOwner && (
            <Link href="/settings" className="btn-ghost-ink">
              Profil bearbeiten
            </Link>
          )}
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-ink/10 pt-5 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-ink-soft">Gelesen</dt>
            <dd className="font-serif text-2xl font-semibold text-ink">{stats.read}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-soft">Lese ich gerade</dt>
            <dd className="font-serif text-2xl font-semibold text-ink">{stats.reading}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-soft">Will lesen</dt>
            <dd className="font-serif text-2xl font-semibold text-ink">{stats.wantToRead}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-soft">Aktueller Streak</dt>
            <dd className="font-serif text-2xl font-semibold text-ink">{stats.streak} Tage</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
