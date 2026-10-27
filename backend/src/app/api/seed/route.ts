import { requireAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { seed } from "../../../../prisma/seed.cjs";
export async function POST() {
  const denied = await requireAccess({ write: true, admin: true });
  if (denied) return denied;
  try {
    const result = await seed(prisma);
    return Response.json({ success: true, ...result });
  } catch {
    return Response.json(
      { success: false, error: "Unable to seed database" },
      { status: 500 },
    );
  }
}
