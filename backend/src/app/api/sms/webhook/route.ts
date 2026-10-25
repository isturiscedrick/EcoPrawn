import { timingSafeEqual } from "node:crypto";
import prisma from "@/lib/prisma";
import { normalizePhone } from "@/lib/unisms";

export async function POST(request: Request) {
  const expected = process.env.UNISMS_WEBHOOK_SECRET;
  if (!expected) return Response.json({ error: "Webhook not configured" }, { status: 503 });
  const supplied = request.headers.get("webhook-secret-key") || "";
  const a = Buffer.from(expected), b = Buffer.from(supplied);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return Response.json({ error: "Invalid webhook secret" }, { status: 401 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const message = body?.message;
  const status = message?.status;
  if (!["sent", "failed", "retrying"].includes(status) || body.event !== `message.${status}` || typeof message.reference_id !== "string" || body.id !== message.reference_id) {
    return Response.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
  const referenceId = message.reference_id;
  const deliveryId = message.metadata?.delivery_id;
  const correlation = typeof deliveryId === "string" ? [{ referenceId }, { id: deliveryId, referenceId: null }] : [{ referenceId }];
  await prisma.smsDelivery.updateMany({
    where: { OR: correlation, recipient: normalizePhone(message.recipient) ?? "invalid", status: { in: ["sending", "pending", "retrying", "unknown"] } },
    data: { referenceId, status, error: status === "failed" ? "UniSMS reported delivery failure; check the provider dashboard" : null },
  });
  return Response.json({ received: true });
}
