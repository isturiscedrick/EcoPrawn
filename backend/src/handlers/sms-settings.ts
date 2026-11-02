import { accountAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { normalizePhone, smsConfigured } from "@/lib/unisms";
import { nextSmsAttempt } from "@/lib/sms";

export async function GET() {
  const account = await accountAccess();
  if (account instanceof Response) return account;
  const [settings, deliveries] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: account.id }, select: { smsPhone: true, smsEnabled: true, lastSmsAt: true } }),
    prisma.smsDelivery.findMany({ where: { userId: account.id }, orderBy: { createdAt: "desc" }, take: 10,
      select: { id: true, content: true, status: true, error: true, createdAt: true } }),
  ]);
  return Response.json({ smsPhone: settings.smsPhone, smsEnabled: settings.smsEnabled, nextAttemptAt: nextSmsAttempt(settings.lastSmsAt), configured: smsConfigured(), deliveries });
}

export async function PATCH(request: Request) {
  const account = await accountAccess({ write: true });
  if (account instanceof Response) return account;
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body || typeof body.smsEnabled !== "boolean" || typeof body.smsPhone !== "string") {
    return Response.json({ error: "Phone number and SMS preference are required" }, { status: 400 });
  }
  const phone = normalizePhone(body.smsPhone);
  if ((body.smsPhone.trim() || body.smsEnabled) && !phone) {
    return Response.json({ error: "Enter a Philippine mobile number such as 09171234567 or +639171234567" }, { status: 400 });
  }
  await prisma.user.update({ where: { id: account.id }, data: { smsPhone: phone, smsEnabled: body.smsEnabled } });
  return Response.json({ success: true, smsPhone: phone, smsEnabled: body.smsEnabled });
}
