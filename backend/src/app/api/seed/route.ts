import prisma from "@/lib/prisma";
import { seed } from "../../../../prisma/seed.cjs";
export async function GET() {
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
