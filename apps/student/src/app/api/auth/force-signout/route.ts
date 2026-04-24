import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Robust origin detection for GCP / Cloud Run / Load Balancers
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  let host = forwardedHost || hostHeader || url.host;
  // Fallback for local development or misconfigured proxies
  if (host.includes("0.0.0.0") || host.includes("127.0.0.1") || host.includes("localhost")) {
     // If we're on localhost but proto is https, it might be a tunnel.
     // But usually we can just stay on whatever host the browser thinks it's on.
  }

  const origin = `${forwardedProto}://${host}`;

  const referer = request.headers.get("referer");
  let locale = "cs";
  if (referer) {
    const match = referer.match(/\/(cs|en|sk)(\/|$)/);
    if (match) locale = match[1];
  }

  const loginUrl = new URL(`/${locale}/login`, origin);
  const response = NextResponse.redirect(loginUrl);

  // Extremely thorough cookie clearance
  const cookiesToClear = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.callback-url",
    "authjs.csrf-token",
    "next-auth.callback-url",
    "next-auth.csrf-token",
    "next-auth.state",
    "authjs.state"
  ];

  cookiesToClear.forEach(cookieName => {
    // Clear at root path with various options
    response.cookies.set(cookieName, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      sameSite: "lax",
      secure: forwardedProto === "https"
    });
  });

  console.log(`DEBUG: Force sign-out. Host: ${host}. Proto: ${forwardedProto}. Origin: ${origin}`);

  return response;
}
