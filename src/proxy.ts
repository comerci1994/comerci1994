import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Optimistic redirect only. Real authorization happens in the DAL
 * (`requireUser`) and in every action / route handler.
 */
const PUBLIC_PATHS = ["/login", "/register"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isLoggedIn = Boolean(req.auth?.user);

  if (!isLoggedIn && !isPublic) {
    const url = new URL("/login", req.nextUrl);
    if (pathname !== "/") url.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL("/decks", req.nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  // Skip API routes (they authenticate themselves and must return JSON, not redirects),
  // Next internals and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
