import { accountAccess } from "@/lib/auth";
import { dispatchSms } from "@/lib/sms";

export async function POST() {
  const account = await accountAccess({ write: true });
  if (account instanceof Response) return account;
  const result = await dispatchSms(account.id, "EcoPrawn: SMS alerts are connected. You will receive water-quality warnings for your tanks.");
  const status = result.status === "not_configured" ? 503 : result.status === "disabled" ? 409 : result.status === "cooldown" ? 429 : result.status === "rejected" && result.providerStatus === 422 ? 422 : ["unknown", "failed", "rejected"].includes(result.status) ? 502 : 200;
  return Response.json(result, { status, headers: result.retryAfterSeconds ? { "Retry-After": String(result.retryAfterSeconds) } : {} });
}
