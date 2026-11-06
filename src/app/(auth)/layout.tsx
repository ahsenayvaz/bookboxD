import { LockIcon } from "@/components/Footer";
import { LogoMark } from "@/components/Logo";

const TRUST = [
  "Dein Passwort wird nur verschlüsselt (bcrypt) gespeichert – niemand kann es lesen.",
  "Nur ein einziges, technisch nötiges Cookie. Kein Tracking, keine Werbung.",
  "Deine Daten gehören dir: Du kannst dein Konto jederzeit vollständig löschen.",
];

// Beim Öffnen der Seite schwingt der Ledereinband auf und gibt das Formular frei.
// Das Layout bleibt beim Wechsel zwischen Anmelden/Registrieren bestehen – das Buch öffnet sich nur einmal.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center overflow-x-clip px-4 pt-10 pb-6 sm:pt-14">
      <div className="auth-book">
        {/* rechte Seite: Formular */}
        <div className="auth-book-page paper rounded-l-sm rounded-r-xl shadow-[1px_0_0_#e2cfb0,3px_1px_0_#d6c09e,5px_2px_0_#c9b28d,0_30px_60px_-20px_rgb(0_0_0/0.8)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#8a6440]/25 to-transparent max-md:hidden"
          />
          <div className="relative px-7 py-9 sm:px-10">
            {children}
            <ul className="mt-8 space-y-1.5 border-t border-dashed border-ink/20 pt-4 text-xs text-ink-soft md:hidden">
              {TRUST.map((t) => (
                <li key={t} className="flex gap-2">
                  <LockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-terracotta" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Einband: vorne Leder, innen die linke Buchseite */}
        <div className="auth-book-cover">
          <div
            aria-hidden
            className="flex flex-col items-center justify-center rounded-l-sm rounded-r-xl bg-[radial-gradient(ellipse_at_30%_20%,#c96a3e,#8f3d1f_60%,#6b2b14)] p-8 text-center shadow-[inset_8px_0_14px_-6px_rgb(0_0_0/0.5),0_30px_60px_-20px_rgb(0_0_0/0.8)]"
          >
            <div className="absolute inset-5 rounded-lg border border-honey/50" />
            <div className="absolute inset-7 rounded-md border border-honey/25" />
            <LogoMark className="relative h-11 bg-gradient-to-b from-[#ffe7b0] to-honey" />
            <p className="mt-2 font-hand text-xl text-honey/80">Mein Lesetagebuch</p>
          </div>

          <div className="auth-book-cover-back hidden rounded-l-xl rounded-r-sm bg-parchment-deep text-ink md:block">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#8a6440]/30 to-transparent" />
            <div className="flex h-full flex-col justify-between px-10 py-10">
              <div>
                <p className="font-hand text-2xl text-terracotta-deep">Ex Libris</p>
                <blockquote className="mt-6 font-serif text-2xl leading-snug text-ink italic [font-variation-settings:'SOFT'_100]">
                  „Wir lesen, um zu wissen, dass wir nicht allein sind.“
                </blockquote>
                <p className="mt-3 text-sm text-ink-soft">— C. S. Lewis</p>
              </div>
              <ul className="space-y-3 text-sm text-ink-soft">
                {TRUST.map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
