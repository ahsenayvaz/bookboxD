import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/actions/auth";
import { getCurrentUser } from "@/lib/dal";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";

// Unterstrich wächst beim Hover von links nach rechts
const navLink =
  "relative text-sand transition-colors hover:text-cream after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-ember after:transition-transform after:duration-300 hover:after:scale-x-100";

export function Header() {
  return (
    <header className="relative z-30 border-b border-line/50">
      <div className="mx-auto flex h-[76px] w-full max-w-[1040px] items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="flex items-center gap-5 text-sm font-medium sm:gap-6">
          <Link href="/search" className={`hidden sm:block ${navLink}`}>
            Bücher
          </Link>
          <SearchBox />
          <Link href="/search" aria-label="Bücher suchen" className="text-sand hover:text-cream sm:hidden">
            <SearchIcon className="h-[18px] w-[18px]" />
          </Link>
          {/* Liest das Session-Cookie → wird erst zur Laufzeit gestreamt */}
          <Suspense fallback={<span className="h-9 w-24" />}>
            <UserNav />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}

async function UserNav() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Link href="/login" className={navLink}>
          Anmelden
        </Link>
        <Link href="/register" className="btn-primary hidden px-4 py-2 text-[13px] sm:inline-flex">
          Konto erstellen
        </Link>
      </>
    );
  }

  return (
    <div className="group relative">
      <button
        type="button"
        aria-haspopup="menu"
        className="flex cursor-pointer items-center gap-2 rounded-full py-1 pr-2 pl-1 text-sand transition-colors group-focus-within:bg-bark group-hover:bg-bark group-hover:text-cream"
      >
        <Avatar src={user.avatarUrl} size={30} />
        <span className="hidden max-w-32 truncate sm:inline">{user.username}</span>
        <svg viewBox="0 0 10 6" className="h-1.5 w-2.5 fill-current transition-transform group-hover:rotate-180" aria-hidden>
          <path d="M0 0h10L5 6z" />
        </svg>
      </button>
      <div
        role="menu"
        className="paper invisible absolute top-full right-0 mt-2 w-52 origin-top-right translate-y-1 scale-95 p-1.5 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
      >
        {/* unsichtbare Brücke, damit das Menü beim Überfahren des Abstands offen bleibt */}
        <span aria-hidden className="absolute inset-x-0 -top-2 h-2" />
        <p className="px-3 pt-1.5 pb-2 font-hand text-lg leading-none text-ink-soft">Hallo, {user.username}!</p>
        <MenuLink href={`/u/${user.username}`}>Mein Profil</MenuLink>
        <MenuLink href="/settings">Einstellungen</MenuLink>
        <div className="mx-2 my-1 border-t border-dashed border-ink/20" />
        <form action={logout}>
          <button
            type="submit"
            role="menuitem"
            className="block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-ink-soft hover:bg-parchment-deep hover:text-terracotta-deep"
          >
            Abmelden
          </button>
        </form>
      </div>
    </div>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="block rounded-md px-3 py-2 text-sm text-ink hover:bg-parchment-deep hover:text-terracotta-deep"
    >
      {children}
    </Link>
  );
}

function SearchBox() {
  return (
    <Form action="/search" role="search" className="relative hidden sm:block">
      <label htmlFor="header-search" className="sr-only">
        Bücher oder Autoren suchen
      </label>
      <input
        id="header-search"
        name="q"
        type="search"
        required
        placeholder="Titel oder Autor …"
        className="h-9 w-44 rounded-full border border-line bg-walnut/80 pr-9 pl-4 text-[13px] text-cream transition-all duration-300 outline-none placeholder:text-dusk focus:w-56 focus:border-ember/60 focus:bg-bark focus:shadow-[0_0_0_4px_rgb(240_160_75/0.12)]"
      />
      <button
        type="submit"
        aria-label="Suchen"
        className="absolute top-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center text-dusk hover:text-ember"
      >
        <SearchIcon className="h-4 w-4" />
      </button>
    </Form>
  );
}

function SearchIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="7" cy="7" r="5" />
      <path d="m11 11 4 4" strokeLinecap="round" />
    </svg>
  );
}
