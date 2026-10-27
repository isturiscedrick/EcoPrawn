import { createHash } from "node:crypto";
import prisma from "@/lib/prisma";

// Shared by all backend instances. One row per hashed subject, with atomic expiry.
export async function authThrottle(subject: string, limit: number, seconds: number) {
  const key = createHash("sha256").update(subject).digest("hex");
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO ecoprawn."AuthThrottle" (key, count, "expiresAt")
    VALUES (${key}, 1, NOW() + ${seconds} * interval '1 second')
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN "AuthThrottle"."expiresAt" <= NOW() THEN 1 ELSE "AuthThrottle".count + 1 END,
      "expiresAt" = CASE WHEN "AuthThrottle"."expiresAt" <= NOW() THEN NOW() + ${seconds} * interval '1 second' ELSE "AuthThrottle"."expiresAt" END
    RETURNING count`;
  return rows[0].count <= limit;
}
