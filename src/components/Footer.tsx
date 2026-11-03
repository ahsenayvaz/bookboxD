import Link from "next/link";
import { LogoMark } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line/50 bg-walnut/60">
      <div className="mx-auto grid w-full max-w-[1040px] gap-8 px-4 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="h-6 bg-sand" />
            <p className="font-hand text-2xl text-sand">Mit Liebe und heißem Kakao gemacht.</p>
          </div>
          <p className="mt-4 max-w-md text-xs leading-relaxed text-dusk">
            © 2026 BookBoxD · INF303 Software Engineering Projekt · Türkisch-Deutsche Universität. Buchdaten von{" "}
            <a href="https://openlibrary.org" className="text-tan hover:text-cream" target="_blank" rel="noreferrer">
              Open Library
            </a>
            .
          </p>
        </div>

        <div className="space-y-3 sm:text-right">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-tan sm:justify-end">
            <Link href="/search" className="hover:text-cream">
              Bücher
            </Link>
            <Link href="/datenschutz" className="hover:text-cream">
              Datenschutz
            </Link>
            <Link href="/kvkk" className="hover:text-cream">
              KVKK
            </Link>
            <a href="https://github.com/ahsenayvaz/bookboxD" className="hover:text-cream" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
          <p className="flex items-center gap-1.5 text-xs text-dusk sm:justify-end">
            <LockIcon />
            Verschlüsselte Passwörter · Kein Tracking · DSGVO &amp; KVKK
          </p>
        </div>
      </div>
    </footer>
  );
}

export function LockIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}
