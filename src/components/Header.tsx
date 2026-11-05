import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/actions/auth";
import { getCurrentUser } from "@/lib/dal";
import { Logo } from "./Logo";

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
    <div className="flex items-center gap-4">
      <Link href={`/u/${user.username}`} className={navLink}>
        {user.username}
      </Link>
      <form action={logout}>
        <button type="submit" className="cursor-pointer text-sand hover:text-cream">
          Abmelden
        </button>
      </form>
    </div>
  );
}

function SearchBox() {
  return (
    <Form action="/search" role="search" className="relative hidden sm:block">
      <input
        name="q"
        type="search"
        required
        placeholder="Titel oder Autor …"
        className="h-9 w-44 rounded-full border border-line bg-walnut/80 px-4 text-[13px] text-cream outline-none placeholder:text-dusk focus:w-56 focus:border-ember/60"
      />
    </Form>
  );
}
