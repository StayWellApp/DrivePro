import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const referer = request.headers.get("referer");
  let locale = "cs";
  if (referer) {
    const match = referer.match(/\/(cs|en|sk)(\/|$)/);
    if (match) locale = match[1];
  }

  // Explicitly construct the login URL using a relative path if possible,
  // but NextResponse.redirect requires an absolute URL. url.origin is safe here.
  const loginUrl = new URL(`/${locale}/login`, url.origin);
  const response = NextResponse.redirect(loginUrl);

  // Thorough cookie clearance
  const cookiesToClear = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.callback-url",
    "authjs.csrf-token",
    "next-auth.callback-url",
    "next-auth.csrf-token"
  ];

  cookiesToClear.forEach(cookieName => {
    response.cookies.set(cookieName, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    // Also try to clear with domain if applicable (sometimes localhost vs 127.0.0.1 causes issues)
    response.cookies.set(cookieName, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      domain: url.hostname
    });
  });

  console.log("DEBUG: Force sign-out triggered. Cookies cleared.");

  return response;
}
