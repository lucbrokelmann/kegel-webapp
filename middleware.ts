import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, isValidSession } from "@/lib/auth";

export const runtime = "nodejs";

export function middleware(request: NextRequest) {
  const isAuthed = isValidSession(request.cookies.get(AUTH_COOKIE)?.value);
  if (!isAuthed) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
