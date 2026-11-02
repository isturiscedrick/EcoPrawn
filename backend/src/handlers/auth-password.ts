import { appOrigin, authClient } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { normalizePhone } from "@/lib/unisms";
import { normalizeUsername, phoneAccount } from "@/lib/phone-account";
import { authThrottle } from "@/lib/auth-throttle";

const reply = (data: object, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (request.headers.get("origin") !== appOrigin()) return reply({ error: "Invalid request origin" }, 403);
  if (Number(request.headers.get("content-length")) > 8192) return reply({ error: "Request too large" }, 413);
  try {
    const text = await request.text();
    if (text.length > 8192) return reply({ error: "Request too large" }, 413);
    let body;
    try { body = JSON.parse(text); } catch { return reply({ error: "Invalid request" }, 400); }
    if (!body || typeof body !== "object") return reply({ error: "Invalid request" }, 400);
    const { action } = body;
    if (!["signup", "signin", "verify", "resend", "complete"].includes(action)) return reply({ error: "Invalid action" }, 400);
    const client = await authClient();
    if (action === "complete") {
      const { data: { user } } = await client.auth.getUser();
      if (!user) return reply({ error: "Please sign in again" }, 401);
      if (!await authThrottle(`complete:${user.id}`, 15, 900)) return reply({ error: "Too many attempts. Try again in 15 minutes." }, 429);
      await phoneAccount(user, body.username);
      return reply({ ok: true });
    }
    let phone = normalizePhone(action === "signin" ? body.identifier : body.phone);
    const username = normalizeUsername(action === "signin" ? body.identifier : body.username);
    if (action === "signin" && !phone && username) {
      if (!await authThrottle(`login-name:${username}`, 15, 900)) return reply({ error: "Too many attempts. Try again in 15 minutes." }, 429);
      phone = (await prisma.user.findUnique({ where: { username }, select: { phone: true } }))?.phone ?? null;
    }
    if (!phone) return reply({ error: action === "signin" ? "Incorrect username, phone number, or password." : "Enter a Philippine mobile number, such as 09171234567." }, 400);
    if (!await authThrottle(`${action}:${phone}`, action === "resend" ? 1 : 10, action === "resend" ? 60 : 900)) {
      return reply({ error: action === "resend" ? "Wait 60 seconds before requesting another code." : "Too many attempts. Try again in 15 minutes." }, 429);
    }
    if (action === "signup" || action === "signin") {
      if (typeof body.password !== "string" || body.password.length < (action === "signup" ? 8 : 1) || body.password.length > 128) return reply({ error: "Use a password between 8 and 128 characters." }, 400);
    }
    if (action === "signup" || action === "resend") {
      if (!await authThrottle(`sms:${phone}`, 5, 3600) || !await authThrottle("sms:global", 100, 3600)) return reply({ error: "SMS limit reached. Please try again in an hour." }, 429);
    }
    if (action === "signup") {
      if (!username) return reply({ error: "Use 3–30 letters, numbers, or underscores, starting with a letter." }, 400);
      if (await prisma.user.findUnique({ where: { username }, select: { id: true } })) return reply({ error: "That username is taken. Choose another." }, 409);
      const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
      if (!name) return reply({ error: "Enter your name." }, 400);
      const { data, error } = await client.auth.signUp({ phone, password: body.password, options: { data: { username, full_name: name } } });
      if (error) return authError(error.code);
      // Confirmation must remain enabled in Supabase. Never accept an unverified signup.
      if (data.session) {
        await client.auth.signOut({ scope: "local" });
        return reply({ error: "Phone verification is not configured. Contact your administrator." }, 503);
      }
      return reply({ verify: true, phone });
    }
    if (action === "resend") {
      const { error } = await client.auth.resend({ type: "sms", phone });
      return error ? authError(error.code) : reply({ ok: true });
    }
    if (action === "verify" && (typeof body.code !== "string" || !/^\d{6,10}$/.test(body.code))) return reply({ error: "Enter the verification code from your text message." }, 400);
    const result = action === "verify"
      ? await client.auth.verifyOtp({ phone, token: body.code, type: "sms" })
      : await client.auth.signInWithPassword({ phone, password: body.password });
    if (result.error) return authError(result.error.code);
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return reply({ error: "Could not verify your session. Try signing in again." }, 401);
    await phoneAccount(user);
    return reply({ ok: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return reply({ error: "That username is taken. Choose another to finish creating your account.", complete: true }, 409);
    if (error instanceof Error && error.message === "USERNAME_REQUIRED") return reply({ error: "Choose a username to finish creating your account.", complete: true }, 409);
    if (error instanceof Error && error.message === "PHONE_UNVERIFIED") return reply({ error: "Verify your phone number before signing in." }, 403);
    // Do not log the exception message: provider/database errors can contain private data.
    const name = error instanceof Error ? error.name : "UnknownError";
    const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : undefined;
    if (name === "PrismaClientInitializationError" || ["P1001", "P1002", "P1008", "P1017", "P2024"].includes(code ?? "")) {
      console.error("[phone-auth] database unavailable", { name, code });
      return reply({ error: "Account service cannot connect to the database. Please try again shortly.", code: "DATABASE_UNAVAILABLE" }, 503);
    }
    console.error("[phone-auth] request failed", { name });
    return reply({ error: "Unable to complete your request. Please try again." }, 503);
  }
}

function authError(code?: string) {
  if (code === "phone_not_confirmed") return reply({ error: "Verify your phone number first.", verify: true }, 403);
  if (code === "otp_expired") return reply({ error: "That code is invalid or expired. Try again or request a new code." }, 400);
  if (["over_sms_send_rate_limit", "over_request_rate_limit"].includes(code ?? "")) return reply({ error: "Please wait before trying again." }, 429);
  if (["phone_provider_disabled", "sms_send_failed", "hook_timeout", "hook_payload_invalid", "hook_timeout_after_retry"].includes(code ?? "")) return reply({ error: "SMS verification is unavailable. Contact your administrator." }, 503);
  if (code === "weak_password") return reply({ error: "Choose a stronger password with at least 8 characters." }, 400);
  return reply({ error: "Could not sign in or create an account. Check your details and try again." }, 400);
}
