import { auth } from "./auth";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user as any;

  const isApiAuthRoute = nextUrl.pathname.includes("/api/auth");
  const isPublicRoute = nextUrl.pathname.includes("/login");
  const isSuperRoute = nextUrl.pathname.includes("/super");

  if (isApiAuthRoute) return;

  if (isPublicRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return intlMiddleware(req);
  }

  if (!isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl),
    );
  }

  // RBAC for Super-Admin routes
  if (isSuperRoute && user?.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return intlMiddleware(req);
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    "/",
    "/(cs|en|sk)/:path*",
    "/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};
