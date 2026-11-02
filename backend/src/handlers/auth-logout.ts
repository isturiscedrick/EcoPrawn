import { setCookie } from "@tanstack/react-start/server";
import { cookies, headers } from "@/lib/request-context";
import { appOrigin, authClient, cookieOptions } from "@/lib/auth";

export async function POST() {
  if ((await headers()).get("origin") !== appOrigin()) {
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const client = await authClient();
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) return Response.json({ error: "Unable to log out. Please try again." }, { status: 503 });
  const response = Response.json({ success: true }, { headers: { "Cache-Control": "private, no-store" } });
  for (const cookie of (await cookies()).getAll()) {
    if (cookie.name.startsWith("sb-") || ["ecoprawn_session", "ecoprawn_google_flow"].includes(cookie.name)) {
      setCookie(cookie.name, "", { ...cookieOptions, maxAge: 0 });
    }
  }
  return response;
}
