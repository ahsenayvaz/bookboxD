import { NextResponse, type NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

// Optimistische Prüfung anhand des Cookies – die eigentliche Autorisierung
// passiert serverseitig in lib/dal.ts bzw. in den Server Actions.
// /login und /register werden hier bewusst NICHT umgeleitet: Ein gültig signiertes Cookie kann
// zu einem gelöschten Nutzer gehören – sonst landet man in einer Schleife und kann sich nicht anmelden.
// Diese Weiterleitung prüft der Auth-Layout gegen die Datenbank (RedirectIfSignedIn).
export async function proxy(req: NextRequest) {
  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = req.nextUrl;

  if (!session && (pathname.startsWith("/settings") || pathname.startsWith("/library"))) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/settings/:path*", "/library/:path*"],
};
