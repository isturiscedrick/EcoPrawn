import type { PrismaClient } from "@prisma/client";

export async function findOrCreateGoogleUser(
  database: Pick<PrismaClient, "user">,
  profile: { authId: string; email: string; name: string | null; canLinkExisting: boolean },
) {
  const linked = await database.user.findUnique({ where: { authId: profile.authId } });
  if (linked) return linked;
  const email = profile.email.trim().toLowerCase();
  const existing = await database.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existing) {
    if (existing.authId === profile.authId) return existing;
    if (existing.authId || !profile.canLinkExisting) throw new Error("Account already exists with another identity");
    // Conditional linking prevents another identity from taking over in a race.
    await database.user.updateMany({
      where: { id: existing.id, authId: null }, data: { authId: profile.authId },
    });
    const result = await database.user.findUnique({ where: { authId: profile.authId } });
    if (!result) throw new Error("Unable to link account");
    return result;
  }
  // Never accept a role from user-editable metadata or change existing roles.
  return database.user.upsert({
    where: { authId: profile.authId }, update: {},
    create: { authId: profile.authId, email, name: profile.name, role: "operator" },
  });
}
