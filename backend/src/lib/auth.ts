import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import prisma from "@/lib/prisma";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.APP_URL?.startsWith("https://") ?? process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function appOrigin() {
  const value = process.env.APP_URL;
  if (!value) throw new Error("APP_URL is required");
  const url = new URL(value);
  const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("APP_URL must use HTTP or HTTPS");
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:" && !isLoopback) {
    throw new Error("APP_URL must use HTTPS in production");
  }
  return url.origin;
}

// Backend route handlers own all session cookies; there is no browser auth client.
export async function authClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase Auth is not configured");
  const store = await cookies();
  return createServerClient(url, key, {
    cookieOptions,
    cookies: {
      getAll: () => store.getAll(),
      setAll: (values) => {
        for (const { name, value, options } of values) store.set(name, value, { ...options, ...cookieOptions });
      },
    },
  });
}

export async function currentUser() {
  const client = await authClient();
  // getUser validates with Supabase Auth, including deleted or banned accounts.
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  return prisma.user.findUnique({
    where: { authId: user.id }, select: { id: true, email: true, name: true, role: true },
  });
}

// Return the verified account so handlers never take ownership from request data.
export async function accountAccess(options: { write?: boolean; admin?: boolean } = {}) {
  if (options.write && (await headers()).get("origin") !== appOrigin()) {
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  if (options.admin && user.role !== "admin") {
    return Response.json({ error: "Administrator access required" }, { status: 403 });
  }
  return user;
}

export async function requireAccess(options: { write?: boolean; admin?: boolean } = {}) {
  const result = await accountAccess(options);
  return result instanceof Response ? result : null;
}
