import { auth } from "./auth";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user as any;

  // Manual list of public paths that should NOT trigger a redirect to login
  const publicPaths = ["/login", "/api/auth", "/api/auth/force-signout"];
  const isPublicRoute = publicPaths.some(path => nextUrl.pathname.includes(path));

  const isSuperRoute = nextUrl.pathname.includes("/super");

  if (isPublicRoute) {
    // If logged in and hitting login page, go to dashboard
    if (isLoggedIn && nextUrl.pathname.includes("/login")) {
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
    // Explicitly redirect to /[locale]/login to avoid loops if / redirects
    const locale = nextUrl.pathname.split('/')[1] || "cs";
    const loginUrl = `/${locale}/login?callbackUrl=${encodedCallbackUrl}`;

    return NextResponse.redirect(new URL(loginUrl, nextUrl));
  }

  // RBAC for Super-Admin routes
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
