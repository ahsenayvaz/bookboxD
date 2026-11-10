import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { DeleteAccountForm, ProfileForm } from "./forms";

export const metadata: Metadata = { title: "Einstellungen" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-[1040px] px-4 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-hand text-2xl text-ember">Dein Leseplatz</p>
          <h1 className="font-serif text-4xl font-semibold text-cream">Einstellungen</h1>
        </div>
        <Link href={`/u/${user.username}`} className="btn-ghost">
          Zum Profil →
        </Link>
      </div>

      <section className="paper mt-8 max-w-2xl p-7 sm:p-8">
        <h2 className="mb-6 font-serif text-xl font-semibold text-ink">Profil</h2>
        <ProfileForm username={user.username} email={user.email} bio={user.bio ?? ""} />
      </section>

      <section className="paper mt-6 max-w-2xl border-l-4 border-[#8f2f1c]/60 p-7 sm:p-8">
        <h2 className="mb-3 font-serif text-xl font-semibold text-ink">Konto löschen</h2>
        <DeleteAccountForm />
      </section>
    </div>
  );
}
