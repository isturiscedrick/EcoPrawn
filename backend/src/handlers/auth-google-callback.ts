import { setCookie } from "@tanstack/react-start/server";

import prisma from "@/lib/prisma";
import { findOrCreateGoogleUser } from "@/lib/google-user";
import { appOrigin, authClient, cookieOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const finish = (path: string) => {
    const response = new Response(null, { status: 307, headers: { Location: new URL(path, appOrigin()).href } });
    response.headers.set("Cache-Control", "private, no-store");
    // Discard sessions from the previous direct-Google implementation.
    for (const name of ["ecoprawn_session", "ecoprawn_google_flow"]) {
      setCookie(name, "", { ...cookieOptions, maxAge: 0 });
    }
    return response;
  };
  if (new URL(request.url).searchParams.has("error")) return finish("/login?error=cancelled");
  const code = new URL(request.url).searchParams.get("code");
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
