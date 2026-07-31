import { auth } from "./auth";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user as any;

  // Paths that are always allowed
  const isApiAuthRoute = nextUrl.pathname.includes("/api/auth");
  const isLoginRoute = nextUrl.pathname.includes("/login");

  if (isApiAuthRoute) return;

  if (isLoginRoute) {
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
    // Determine locale for redirect or fallback to default
    const localeMatch = nextUrl.pathname.match(/^\/(cs|en|sk)/);
    const locale = localeMatch ? localeMatch[1] : "cs";

    return NextResponse.redirect(
      new URL(`/${locale}/login?callbackUrl=${encodedCallbackUrl}`, nextUrl),
    );
  }

  const isSuperRoute = nextUrl.pathname.includes("/super");
  if (isSuperRoute && user?.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: [
    "/",
    "/(cs|en|sk)/:path*",
    "/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};
