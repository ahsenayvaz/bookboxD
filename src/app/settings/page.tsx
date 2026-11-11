import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { AvatarForm, DeleteAccountForm, ProfileForm } from "./forms";

export const metadata: Metadata = { title: "Einstellungen" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-[1040px] px-4 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4 motion-safe:animate-fade-up">
        <div>
          <p className="font-hand text-2xl text-ember">Dein Leseplatz</p>
          <h1 className="font-serif text-4xl font-semibold text-cream [font-variation-settings:'SOFT'_100]">
            Einstellungen
          </h1>
        </div>
        <Link href={`/u/${user.username}`} className="btn-ghost">
          Zum Profil →
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_300px]">
        <section className="paper p-7 motion-safe:animate-fade-up sm:p-8" style={{ animationDelay: "80ms" }}>
          <h2 className="mb-6 font-serif text-xl font-semibold text-ink">Profil</h2>
          <ProfileForm username={user.username} email={user.email} bio={user.bio ?? ""} />
        </section>
        <section className="paper p-7 motion-safe:animate-fade-up" style={{ animationDelay: "160ms" }}>
          <h2 className="mb-6 font-serif text-xl font-semibold text-ink">Profilbild</h2>
          <AvatarForm avatarUrl={user.avatarUrl} />
        </section>
      </div>

      <section
        className="paper mt-6 max-w-2xl border-l-4 border-[#8f2f1c]/60 p-7 motion-safe:animate-fade-up sm:p-8"
        style={{ animationDelay: "240ms" }}
      >
        <h2 className="mb-3 font-serif text-xl font-semibold text-ink">Konto löschen</h2>
        <DeleteAccountForm />
      </section>
    </div>
  );
}
