# EcoPrawn backend

This Next.js API service owns database access. It has no UI pages.

- `prisma/schema.prisma` defines the PostgreSQL models.
- `src/lib/prisma.ts` creates the shared Prisma client.
- `src/app/api/` contains tank CRUD, water telemetry and alert creation, and the seed endpoint.

## Run locally

```bash
npm install
```

Copy `.env.example` to `.env` and set `DATABASE_URL`, then run:

```bash
npm run db:push
npm run db:seed
npm run dev
```

On Windows, you can instead run `./setup-db.ps1` from the repository root after installing dependencies. Stop backend development servers before generating the Prisma client or changing the database schema. Restart the backend after changing `.env`.

The API listens on [http://localhost:4000](http://localhost:4000). Run the frontend separately on port 3000. Its `/api/*` requests are forwarded here by `frontend/next.config.ts`.

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| `/api/tanks` | GET, POST | List or create tanks |
| `/api/tanks/:id` | GET, PATCH, DELETE | Read, update or delete a tank |
| `/api/water` | GET, POST | Read or record telemetry, with optional `tankId` query filter |
| `/api/seed` | POST | Populate demo data when there are no tanks |

Use `npm run db:seed` during local setup. The HTTP seed endpoint now requires an authenticated administrator and a same-origin POST.

Use `npm run build` and `npm start` for production, `npm run typecheck` to check TypeScript, and `npm run db:studio` to browse the database. Deploy this service separately and set the frontend's `BACKEND_URL` before building the frontend. Keep database credentials in this backend only.

## Sample data

`src/data/demo.json` owns the transferred frontend fixtures and form defaults. `prisma/seed.cjs` imports operational records into PostgreSQL in one transaction. Run `npm run db:seed` from this folder. It skips the import when tanks already exist, preserving existing records. No demo user credentials are created.

`GET /api/dashboard` reads persisted tanks, telemetry, scans, schedules, biofloc metrics, logs, and alerts. `GET /api/demo` serves sample readouts for the marketing/login pages and defaults for the add-tank form. Those readouts are examples, not live telemetry. The original seed endpoint delegates to the same seed function as the CLI.

## Google sign-in with Supabase Auth

1. Enable Google in Supabase Authentication > Sign In / Providers. Enter your Google OAuth client ID and secret there.
2. In Google Cloud, register the Supabase callback URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`.
3. In Supabase URL Configuration, set Site URL to `http://localhost:3000` and add `http://localhost:3000/api/auth/google/callback` to Redirect URLs. Add the corresponding HTTPS frontend URLs for a hosted deployment.
4. Set backend `APP_URL`, `SUPABASE_URL`, and `SUPABASE_PUBLISHABLE_KEY`. Keep DATABASE_URL as configured. The app does not need a Supabase service-role key.
5. Start both apps and sign in. New Google users appear in Supabase Authentication > Users and get an app User row with role `operator`.

The additive database change in `prisma/link-supabase-auth.sql` has been applied to the hosted ecoprawn schema. For a fresh local database use the Prisma schema. Existing app rows are linked on the next verified Google login, preserving their IDs and roles. Existing rows are not bulk-created as Auth accounts. A unique nullable authId stores the Supabase user ID. Once linked, subsequent requests use that ID rather than matching email addresses. New accounts never receive admin from Google or Supabase user metadata. Existing admin assignments stay unchanged.

The old AUTH_SECRET, GOOGLE_ALLOWED_EMAILS, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET variables are no longer read by the application. Google credentials belong in the Supabase provider settings. Existing local values have been preserved so you can copy them there. Old custom session cookies no longer grant access; users must sign in again.

The backend uses the official Supabase SSR client with PKCE and HttpOnly cookies. The frontend proxies all auth routes to the backend. Dashboard middleware verifies the session through the backend and forwards refreshed cookies to the browser. Each operational API handler verifies the Supabase user through getUser and reads the app's current role from the database. Mutations require a same-origin request. Authenticated responses are never cached.

Logout revokes the current Supabase session's refresh token and clears cookies. Previously copied access tokens may remain valid until their expiry. Deleting an app User row blocks its current app access, but registration is open and signing in again can create a new operator record. Use Supabase account controls when managing access.

The ecoprawn tables remain accessible through the backend Prisma connection only. Existing RLS protections remain enabled. Roles are stored in the app database, never in editable user metadata.

Run `npm run test:google-user` for account-linking and role tests, and `npm run test:auth` for isolated authentication rejection, PKCE, callback, and logout checks. Auth integration tests use a local mock Supabase endpoint on port 4108 and a test backend on port 4107; they do not contact Google or write database records.

Manual verification: sign in with an existing account and a new Google account, check Authentication > Users, confirm authId links each app User and that new roles are operator, reload the dashboard, and log out. Complete Google consent in your browser; tests cannot substitute for that step.

References: [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google), [server-side cookies](https://supabase.com/docs/guides/auth/server-side/creating-a-client).

## Water-quality SMS with UniSMS

Water readings submitted to `POST /api/water` now create warnings for all five target ranges and can send an SMS to the signed-in tank owner's saved number. The backend calls UniSMS and saves delivery history in the same Supabase PostgreSQL database as the tanks. No Supabase service-role key or browser SMS credentials are needed.

### Provider setup

1. In your [UniSMS dashboard](https://unismsapi.com/), get the API secret key and the sender ID assigned to your account. The sender ID is required; do not assume `EcoPrawn` or `UniSMS` is available on your account.
2. Set these variables in `backend/.env` and your hosted backend's environment:

   ```dotenv
   UNISMS_API_KEY="your-secret-key"
   UNISMS_SENDER_ID="your-assigned-sender-id"
   UNISMS_WEBHOOK_SECRET="your-unisms-webhook-secret"
   ```

3. Restart the backend. Sign in, open **Dashboard > Alerts**, save a Philippine mobile number, and enable SMS alerts. Numbers such as `09171234567` normalize to `+639171234567`. Use a number you own or have permission to notify.
4. Click **Send test SMS**. This sends a real message and uses provider credits. The UI shows `pending` when queued; that does not mean it has been sent yet.
5. For delivery updates, register `https://YOUR_FRONTEND_DOMAIN/api/sms/webhook` in the UniSMS dashboard. The frontend proxies this route to the backend; a publicly reachable backend HTTPS URL works too. Set `UNISMS_WEBHOOK_SECRET` to the Webhook Secret Key shown by UniSMS. Localhost cannot receive provider webhooks without an HTTPS tunnel. Refresh delivery status on the Alerts page after delivery.

The provider setup is still required even though the Supabase schema change has already been applied to project `uzedgsewqhehhnddlvsh`. The local `.env` template contains empty placeholders. Never commit your secret values or put them in frontend variables.

### Sending behavior

- Alerts are off by default and belong to each app account. The backend always derives the owner from the verified Supabase session and checks tank ownership.
- Thresholds are DO below 4.5 mg/L, pH outside 7.5–8.5, temperature outside 26–30 C, salinity outside 10–20 ppt, or water level below 90%. All warnings for a reading share one SMS.
- A database transaction permits one SMS attempt every five minutes per account across all tanks, including test messages and rejected requests. The test button shows the remaining time and the API returns `Retry-After` for cooldown responses. Disabled alerts return a separate error. Warnings during that interval remain in the event log; SMS messages are skipped rather than queued for later.
- SMS is triggered by new readings submitted through the backend, not by viewing the dashboard, loading demo fixtures, or writing directly to Supabase. Hardware must submit readings through the authenticated API. This does not add a background sensor poller.
- Provider and SMS database failures do not undo saved water readings. Explicit provider validation/authentication rejections are recorded as `rejected` with the returned field errors. A timeout or ambiguous send result is recorded as `unknown`. A process interruption may leave `sending`. Check UniSMS before attempting another send; paid requests are never automatically retried. Authenticated webhooks can reconcile uncertain states.
- Webhooks verify the shared secret with a constant-time comparison. They match the saved provider reference or the delivery ID metadata plus recipient. Late retry events cannot overwrite terminal `sent` or `failed` results. Delivery history is backend-only; the new table enables RLS and revokes direct `anon`/`authenticated` access.

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| `/api/sms/settings` | GET, PATCH | Own phone, preference, and ten most recent deliveries |
| `/api/sms/test` | POST | Send a fixed test message to the saved number |
| `/api/sms/webhook` | POST | Receive UniSMS delivery events using its webhook secret |

For a fresh database, generate the client and create tables from `prisma/schema.prisma`. For an existing pre-SMS hosted database, `prisma/add-sms.sql` is the additive migration for the `ecoprawn` schema. Change the schema qualifier for other installations. Do not rerun this migration on the already updated project.

Run `npm run test:sms` for provider, phone, threshold, cooldown, account-isolation, webhook and telemetry-failure checks. These tests mock UniSMS and do not send paid messages. The existing account and Google-user tests remain available.

Reference: [UniSMS SMS API](https://unismsapi.com/docs/sms).

### Test a low-oxygen alert

Run `npm run test:oxygen` from `backend` for an automated test without network requests or paid SMS. It exercises the water route and dashboard alert derivation: healthy oxygen and the 4.5 mg/L boundary stay quiet, while 3 mg/L creates one warning and invokes SMS for the tank owner. It also checks that another account's tank cannot receive the reading.

To create an actual test alert in Supabase and send an SMS to your saved number:

```bash
npm run test:oxygen:live
```

This requires backend `.env` credentials and exactly one SMS-enabled account. If multiple accounts are enabled, select the app User ID explicitly with `npm run test:oxygen:live -- --user-id YOUR_APP_USER_ID`. The command respects the five-minute SMS cooldown and creates no data while that cooldown is active.

The live test creates or reuses a separate tank named `TEST - Oxygen alert`, records oxygen at 3 mg/L with the other parameters in range, and invokes the real water route. It verifies the persisted alert and the dashboard API response. The CLI supplies the selected account identity; it does not test browser authentication. The test tank and alert stay in the database so you can inspect them in the dashboard. Each live run can use SMS credits. `pending` means UniSMS accepted the request; delivery confirmation comes separately from UniSMS.
