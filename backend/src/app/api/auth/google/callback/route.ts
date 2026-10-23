import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { findOrCreateGoogleUser } from "@/lib/google-user";
import { appOrigin, authClient, cookieOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const finish = (path: string) => {
    const response = NextResponse.redirect(new URL(path, appOrigin()));
    response.headers.set("Cache-Control", "private, no-store");
    // Discard sessions from the previous direct-Google implementation.
    for (const name of ["ecoprawn_session", "ecoprawn_google_flow"]) {
      response.cookies.set(name, "", { ...cookieOptions, maxAge: 0 });
    }
    return response;
  };
  if (request.nextUrl.searchParams.has("error")) return finish("/login?error=cancelled");
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return finish("/login?error=expired");
  const client = await authClient();
  try {
    // Supabase validates the OAuth state and the cookie-backed PKCE verifier.
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) return finish("/login?error=expired");
    const { data: { user }, error: userError } = await client.auth.getUser();
    const googleIdentity = user?.identities?.find(identity => identity.provider === "google");
    if (userError || !user?.email || !user.email_confirmed_at || !googleIdentity) {
      await client.auth.signOut({ scope: "local" });
      return finish("/login?error=unauthorized");
    }
    await findOrCreateGoogleUser(prisma, {
      authId: user.id,
      email: user.email,
      name: typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : null,
      // Existing direct-Google accounts were restricted to Google-managed email.
      canLinkExisting: user.email.toLowerCase().endsWith("@gmail.com") ||
        typeof googleIdentity.identity_data?.hd === "string",
    });
    return finish("/dashboard");
  } catch {
    await client.auth.signOut({ scope: "local" });
    return finish("/login?error=failed");
  }
}
