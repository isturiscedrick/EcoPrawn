import type { User } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";
import { normalizePhone } from "@/lib/unisms";

export function normalizeUsername(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const username = value.trim().toLowerCase();
  return /^[a-z][a-z0-9_]{2,29}$/.test(username) ? username : null;
}

// Only a Supabase-validated, confirmed phone can create an application account.
export async function phoneAccount(user: User, requestedUsername?: unknown) {
  const phone = normalizePhone(user.phone?.startsWith("+") ? user.phone : `+${user.phone}`);
  if (!phone || !user.phone_confirmed_at) throw new Error("PHONE_UNVERIFIED");
  const existing = await prisma.user.findUnique({ where: { authId: user.id } });
  if (existing) return existing;
  const username = normalizeUsername(requestedUsername ?? user.user_metadata.username);
  if (!username) throw new Error("USERNAME_REQUIRED");
  const name = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name.trim().slice(0, 100) : username;
  return prisma.user.upsert({
    where: { authId: user.id }, update: {},
    create: { authId: user.id, phone, username, name, role: "operator" },
  });
}
