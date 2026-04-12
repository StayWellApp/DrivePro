import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(new URL("/", origin));

  // Manual cookie clearance to bypass any NextAuth CSRF/Session state loops
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
