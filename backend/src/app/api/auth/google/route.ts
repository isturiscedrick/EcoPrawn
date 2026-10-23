import { NextResponse } from "next/server";
import { appOrigin, authClient } from "@/lib/auth";

export async function GET() {
  try {
    const client = await authClient();
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: appOrigin() + "/api/auth/google/callback",
        skipBrowserRedirect: true,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error || !data.url) throw new Error("Unable to start Google sign-in");
    const response = NextResponse.redirect(data.url);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=configuration", appOrigin()));
  }
}
