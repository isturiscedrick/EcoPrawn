import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { appOrigin, authClient, cookieOptions } from "@/lib/auth";

export async function POST() {
  if ((await headers()).get("origin") !== appOrigin()) {
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const client = await authClient();
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) return Response.json({ error: "Unable to log out. Please try again." }, { status: 503 });
  const response = NextResponse.json({ success: true }, { headers: { "Cache-Control": "private, no-store" } });
  for (const cookie of (await cookies()).getAll()) {
    if (cookie.name.startsWith("sb-") || ["ecoprawn_session", "ecoprawn_google_flow"].includes(cookie.name)) {
      response.cookies.set(cookie.name, "", { ...cookieOptions, maxAge: 0 });
    }
  }
  return response;
}
