export function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const phone = value.trim().replace(/[\s()-]/g, "");
  if (/^09\d{9}$/.test(phone)) return `+63${phone.slice(1)}`;
  return /^\+639\d{9}$/.test(phone) ? phone : null;
}

export function smsConfigured() {
  return Boolean(process.env.UNISMS_API_KEY && process.env.UNISMS_SENDER_ID);
}

export type WaterReading = {
  dissolvedOxygen: number; ph: number; temperature: number; salinity: number; waterLevel: number;
};

export function waterWarnings(reading: WaterReading) {
  const warnings: string[] = [];
  if (reading.dissolvedOxygen < 4.5) warnings.push(`DO ${reading.dissolvedOxygen} mg/L (min 4.5)`);
  if (reading.ph < 7.5 || reading.ph > 8.5) warnings.push(`pH ${reading.ph} (7.5-8.5)`);
  if (reading.temperature < 26 || reading.temperature > 30) warnings.push(`Temperature ${reading.temperature} C (26-30)`);
  if (reading.salinity < 10 || reading.salinity > 20) warnings.push(`Salinity ${reading.salinity} ppt (10-20)`);
  if (reading.waterLevel < 90) warnings.push(`Water level ${reading.waterLevel}% (min 90)`);
  return warnings;
}

export type SmsResult = { referenceId: string; status: string; error: string | null };

export class SmsProviderError extends Error {
  constructor(message: string, public httpStatus: number, public definitive: boolean) {
    super(message);
    this.name = "SmsProviderError";
  }
}

function providerDetail(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const data = payload as Record<string, unknown>;
  const details: string[] = [];
  if (typeof data.errors === "string") details.push(data.errors);
  else if (data.errors && typeof data.errors === "object") {
    const errors = data.errors as Record<string, unknown>;
    for (const field of ["sender_id", "recipient", "content", "metadata", "base"]) {
      const value = errors[field];
      const messages = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : typeof value === "string" ? [value] : [];
      if (messages.length) details.push(`${field}: ${messages.join(" ")}`);
    }
  }
  if (!details.length && typeof data.message === "string") details.push(data.message);
  let detail = details.join(" ").replace(/[\r\n\t]/g, " ");
  const key = process.env.UNISMS_API_KEY;
  if (key) {
    detail = detail.split(key).join("[redacted]");
    detail = detail.split(Buffer.from(`${key}:`).toString("base64")).join("[redacted]");
  }
  return detail.slice(0, 1000);
}

export async function sendSms(recipient: string, content: string, deliveryId: string): Promise<SmsResult> {
  if (!smsConfigured()) throw new Error("SMS provider is not configured");
  if (!normalizePhone(recipient) || content.length === 0 || content.length > 670) throw new Error("Invalid SMS input");
  const response = await fetch("https://unismsapi.com/api/sms", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.UNISMS_API_KEY}:`).toString("base64")}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ recipient, content, sender_id: process.env.UNISMS_SENDER_ID, metadata: { delivery_id: deliveryId } }),
    signal: AbortSignal.timeout(10000),
    cache: "no-store",
  });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const detail = providerDetail(payload);
    throw new SmsProviderError(`UniSMS rejected the request (HTTP ${response.status})${detail ? `: ${detail}` : ""}`, response.status, [400, 401, 403, 404, 422, 429].includes(response.status));
  }
  const data = await response.json();
  const message = data?.message;
  if (typeof message?.reference_id !== "string" || !["pending", "retrying", "sent", "failed"].includes(message.status)) {
    throw new Error("UniSMS returned an unexpected response; check the provider dashboard before retrying");
  }
  return { referenceId: message.reference_id, status: message.status, error: message.status === "failed" ? "UniSMS reported delivery failure" : null };
}
