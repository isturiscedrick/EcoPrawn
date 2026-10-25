import prisma from "@/lib/prisma";
import { sendSms, smsConfigured, SmsProviderError } from "@/lib/unisms";

export const SMS_COOLDOWN_MS = 5 * 60 * 1000;

export function nextSmsAttempt(lastSmsAt: Date | null) {
  if (!lastSmsAt) return null;
  const next = new Date(lastSmsAt.getTime() + SMS_COOLDOWN_MS);
  return next.getTime() > Date.now() ? next.toISOString() : null;
}

type DispatchResult = { status: string; error?: string; deliveryId?: string; providerStatus?: number; retryAfterSeconds?: number };

// Claim the account's send slot in PostgreSQL so concurrent requests cannot duplicate a send.
export async function dispatchSms(userId: string, content: string, tankId: string | null = null): Promise<DispatchResult> {
  if (!smsConfigured()) return { status: "not_configured", error: "Configure the UniSMS key and sender ID in the backend, then restart it." };
  const delivery = await prisma.$transaction(async (tx) => {
    const now = new Date();
    const claimed = await tx.user.updateMany({
      where: { id: userId, smsEnabled: true, smsPhone: { not: null }, OR: [{ lastSmsAt: null }, { lastSmsAt: { lte: new Date(now.getTime() - SMS_COOLDOWN_MS) } }] },
      data: { lastSmsAt: now },
    });
    if (!claimed.count) return null;
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { smsPhone: true } });
    return tx.smsDelivery.create({ data: { userId, tankId, recipient: user.smsPhone!, content } });
  });
  if (!delivery) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { smsEnabled: true, smsPhone: true, lastSmsAt: true } });
    if (!user.smsEnabled || !user.smsPhone) return { status: "disabled", error: "Save your mobile number and enable SMS alerts before sending a test." };
    const next = nextSmsAttempt(user.lastSmsAt);
    const retryAfterSeconds = next ? Math.max(1, Math.ceil((Date.parse(next) - Date.now()) / 1000)) : 1;
    return { status: "cooldown", error: `Wait ${retryAfterSeconds} seconds before another SMS attempt.`, retryAfterSeconds };
  }

  try {
    const result = await sendSms(delivery.recipient, content, delivery.id);
    // A webhook may already have advanced the status while the send request was in flight.
    await prisma.smsDelivery.updateMany({ where: { id: delivery.id, status: "sending" }, data: result });
    return { status: result.status, deliveryId: delivery.id, ...(result.error ? { error: result.error } : {}) };
  } catch (error) {
    // A timeout may still have queued an SMS. Never automatically retry a paid request.
    const rejected = error instanceof SmsProviderError && error.definitive;
    const status = rejected ? "rejected" : "unknown";
    const detail = error instanceof Error ? error.message : "SMS request failed";
    await prisma.smsDelivery.updateMany({
      where: { id: delivery.id, status: "sending" },
      data: { status, error: detail },
    });
    return { status, deliveryId: delivery.id, error: detail, ...(error instanceof SmsProviderError ? { providerStatus: error.httpStatus } : {}) };
  }
}
