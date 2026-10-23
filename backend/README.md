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
