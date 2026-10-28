# Phone and username accounts

Users sign up with a name, username, Philippine mobile number, and password. Supabase Auth stores the password and verifies the SMS code. UniSMS sends the message through the `send-auth-sms` Edge Function. After verification, the backend creates an `ecoprawn.User` with role `operator`. Google sign-in remains available.

## Supabase setup

1. Authentication → Sign In / Providers → Phone: enable Phone and require phone confirmation. Keep public signup enabled. Configure an OTP expiry of 5 minutes and a resend interval of at least 60 seconds.
2. Authentication → Auth Hooks: create a Send SMS HTTP hook pointing to `https://uzedgsewqhehhnddlvsh.supabase.co/functions/v1/send-auth-sms`. Generate a signing secret.
3. Edge Functions → Secrets: set `SEND_SMS_HOOK_SECRET` to that signing secret, including its `v1,whsec_` prefix. Add `UNISMS_API_KEY` and `UNISMS_SENDER_ID` using the existing values in `backend/.env`.
4. Enable the hook. The function validates the signed payload before sending any SMS. Its platform JWT check is disabled because Supabase Auth uses webhook signatures.
   The SMS includes the brand, OTP, phone-verification purpose, and expiration required by UniSMS. It defaults to 300 seconds, matching the five-minute Supabase expiry above. If you change Supabase's expiry, also set the Edge Function secret `SMS_OTP_EXPIRY_SECONDS` to the same number of seconds. This variable only controls the message text; Supabase enforces expiry.
5. Open `/login`, choose Sign up, and test with a phone you own. No real SMS is sent by the automated tests.

Function source: `supabase/functions/send-auth-sms/index.ts`. It is deployed separately from Next.js. Provider errors never return the OTP or secret to the browser. OTPs are not written to application SMS history.

## Accounts and limits

### Database connection troubleshooting

If `/api/auth/password` returns `DATABASE_UNAVAILABLE`, signup failed before SMS delivery. The local runtime uses the Supabase transaction pooler on port 6543 with `pgbouncer=true`, `connection_limit=2`, `connect_timeout=15`, and `pool_timeout=20`. This was verified when the session pooler on port 5432 timed out. Keep `schema=ecoprawn` and `sslmode=require`. Restart the backend after changing its environment.

For Prisma schema migrations, use a working session or direct connection instead of the transaction pooler. The original session connection remains in `SUPABASE_DATABASE_URL`; `db:connect:supabase` verifies it before switching back. Do not switch back while that endpoint is unavailable.

- Usernames are case-insensitive, 3–30 characters, start with a letter, and allow letters, numbers, and underscores.
- Phone numbers accept `09xxxxxxxxx` or `+639xxxxxxxxx` and are stored in the latter format.
- `User.phone` is the verified account number. `User.smsPhone` is only the alert destination.
- Phone-only accounts have a null email. Passwords are never stored in the application User table.
- Existing roles are preserved. Client metadata never controls roles.
- If another user claims the same username before verification finishes, the verified user can choose another username. Interrupted signup can be resumed by signing in with the phone number.
- Login attempts, verification attempts, and SMS requests are throttled in Postgres across server instances. Supabase's own Auth rate limits also apply. Production deployments should enable Supabase CAPTCHA and configure provider spending limits.
- Expired `ecoprawn.AuthThrottle` rows can be periodically deleted using `DELETE FROM ecoprawn."AuthThrottle" WHERE "expiresAt" < NOW() - interval '1 day'`.

The hosted migration `phone_password_accounts` is recorded in `prisma/phone-accounts.sql`; do not rerun it on this project. Prisma schema changes require regeneration and a backend restart.

Run `bun run test:phone-auth` and `bun run typecheck` in `backend/`, and `bun run typecheck` in `frontend/`.

Reference: [Supabase Send SMS hook](https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook).
