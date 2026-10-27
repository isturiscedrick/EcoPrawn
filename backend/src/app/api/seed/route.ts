import { accountAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { seed } from "../../../../prisma/seed.cjs";
export async function POST() {
  const account = await accountAccess({ write: true, admin: true });
  if (account instanceof Response) return account;
  try {
    const result = await seed(prisma, account.id);
    return Response.json({ success: true, ...result });
  } catch {
    return Response.json(
      { success: false, error: "Unable to seed database" },
      { status: 500 },
    );
  }
}
