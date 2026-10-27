import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

// Supabase authenticates this endpoint with a signed Standard Webhooks payload.
// Do not log the payload: it contains a live verification code.
Deno.serve(async (request: Request) => {
  const fail = (status: number, message: string) => Response.json({ error: { http_code: status, message } }, { status });
  if (request.method !== "POST") return fail(405, "Method not allowed");
  const secret = Deno.env.get("SEND_SMS_HOOK_SECRET")?.replace(/^v1,whsec_/, "");
  const apiKey = Deno.env.get("UNISMS_API_KEY");
  const sender = Deno.env.get("UNISMS_SENDER_ID");
  // Must match Authentication > Phone > SMS OTP expiry in Supabase.
  const expirySeconds = Number(Deno.env.get("SMS_OTP_EXPIRY_SECONDS") ?? "300");
  if (!Number.isInteger(expirySeconds) || expirySeconds < 60 || expirySeconds > 86400) return fail(503, "SMS expiry is not configured correctly");
  const expiry = expirySeconds % 60 === 0 ? `${expirySeconds / 60} minutes` : `${expirySeconds} seconds`;
  if (!secret || !apiKey || !sender) return fail(503, "SMS delivery is not configured");
  const payload = await request.text();
  if (payload.length > 32768) return fail(413, "Payload too large");
  let event: { user?: { phone?: string }; sms?: { otp?: string } };
  try {
    event = new Webhook(secret).verify(payload, Object.fromEntries(request.headers)) as typeof event;
  } catch {
    return fail(401, "Invalid webhook signature");
  }
  const phone = event.user?.phone?.replace(/^\+?/, "+");
  const otp = event.sms?.otp;
  if (!phone || !/^\+639\d{9}$/.test(phone) || typeof otp !== "string" || !/^\d{6,10}$/.test(otp)) return fail(400, "Invalid verification request");
  try {
    const response = await fetch("https://unismsapi.com/api/sms", {
      method: "POST",
      headers: { Authorization: `Basic ${btoa(`${apiKey}:`)}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ recipient: phone, sender_id: sender, content: `Your EcoPrawn OTP code is ${otp} for phone verification. Please do not share. Expires in ${expiry}.`, metadata: { webhook_id: request.headers.get("webhook-id") } }),
      signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) return fail(502, "SMS provider could not deliver the code");
    const result = await response.json();
    if (!result.message?.reference_id || !["pending", "retrying", "sent"].includes(result.message.status)) return fail(502, "SMS delivery failed");
    return Response.json({});
  } catch {
    return fail(502, "SMS delivery unavailable");
  }
});
