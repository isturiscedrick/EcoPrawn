import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next();
  // Route handlers can refresh session cookies; never cache their responses.
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export const config = { matcher: ["/api/:path*"] };
