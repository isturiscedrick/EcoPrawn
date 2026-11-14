import { accountAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isRecord } from "@/lib/api-validation";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const account = await accountAccess({ write: true, admin: false });
  if (account instanceof Response) return account;
  const id = params.id;
  if (!id || id.length > 128 || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return Response.json({ success: false, error: "Invalid alert ID" }, { status: 400 });
  }
  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body) || Object.keys(body).some(key => key !== "resolutionNote")) {
    return Response.json({ success: false, error: "Invalid resolution details" }, { status: 400 });
  }
  const note = body.resolutionNote;
  if (note !== undefined && (typeof note !== "string" || note.trim().length > 500)) {
    return Response.json({ success: false, error: "Resolution note must be 500 characters or fewer" }, { status: 400 });
  }
  try {
    const alert = await prisma.alert.findFirst({ where: { id, userId: account.id }, select: { id: true, resolved: true } });
    if (!alert) return Response.json({ success: false, error: "Alert not found" }, { status: 404 });
    if (alert.resolved) return Response.json({ success: false, error: "Alert is already resolved" }, { status: 409 });
    const updated = await prisma.alert.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolutionNote: typeof note === "string" ? note.trim() || null : null,
        resolvedById: account.id,
      },
      select: { id: true, resolved: true, resolvedAt: true, resolutionNote: true },
    });
    return Response.json({ success: true, alert: updated });
  } catch {
    return Response.json({ success: false, error: "Unable to resolve alert" }, { status: 500 });
  }
}
