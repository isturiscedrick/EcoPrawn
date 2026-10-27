import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const backend = (process.env.BACKEND_URL || "http://localhost:4000").replace(/\/$/, "");
  try {
    // The backend verifies and refreshes Supabase sessions. Forward every cookie
    // chunk and every Set-Cookie header so refresh tokens reach the browser.
    const session = await fetch(`${backend}/api/auth/session`, {
      headers: { Cookie: request.headers.get("cookie") || "" },
      cache: "no-store", signal: AbortSignal.timeout(15000),
    });
    const response = session.status === 401
      ? NextResponse.redirect(new URL("/login", request.url))
      : session.ok ? NextResponse.next()
      : new NextResponse("Unable to verify your session. Please refresh to try again.", { status: 503 });
    for (const cookie of session.headers.getSetCookie()) response.headers.append("Set-Cookie", cookie);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    return new NextResponse("Unable to reach the sign-in service. Please refresh to try again.", { status: 503 });
  }
}

export const config = { matcher: ["/dashboard/:path*"] };
