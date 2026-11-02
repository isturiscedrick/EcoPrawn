import { currentUser } from "@/lib/auth";

export async function GET() {
  const user = await currentUser();
  return Response.json({ user }, { status: user ? 200 : 401, headers: { "Cache-Control": "no-store" } });
}
