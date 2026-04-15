import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const referer = request.headers.get("referer");
  let locale = "cs";
  if (referer) {
    const match = referer.match(/\/(cs|en|sk)(\/|$)/);
    if (match) locale = match[1];
  }

  // Explicitly construct the login URL
  const loginUrl = `${url.origin}/${locale}/login`;
  const response = NextResponse.redirect(loginUrl);

  // Thorough cookie clearance
  const cookiesToClear = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.callback-url",
    "authjs.csrf-token"
  ];

  cookiesToClear.forEach(cookieName => {
    response.cookies.set(cookieName, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  });

  return response;
}
