import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session token from cookies
  const sessionToken = request.cookies.get("authjs.session-token")?.value ||
                      request.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  // Protected routes
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/loans") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/audit") ||
    pathname.startsWith("/cloud");

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && (pathname.startsWith("/auth/"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect non-logged-in users to sign in
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
