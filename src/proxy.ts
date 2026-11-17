import { NextResponse, type NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

export async function proxy(req: NextRequest) {
  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = req.nextUrl;

  if (!session && (pathname.startsWith("/settings") || pathname.startsWith("/library"))) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/settings/:path*", "/library/:path*", "/login", "/register"],
};
