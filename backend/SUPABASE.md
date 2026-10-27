# Supabase connection

Project: `uzedgsewqhehhnddlvsh`.

The application tables live in the private `ecoprawn` schema. The existing local records were copied with their IDs, timestamps, and relationships intact. Row-level security and account policies are enabled on all eight tables. Application access goes through the backend's PostgreSQL connection, not the browser Data API. The schema remains inaccessible to browser roles.

## Account ownership

`Tank`, `BioflocMetric`, `EffluentLog`, and `Alert` have an indexed `userId` foreign key to `User.id`. Telemetry, scans, and feed schedules inherit ownership through their tank. Logs and alerts retain their owner when a tank is deleted. Every dashboard and tank/water query filters by the verified account, including mutations. Administrator accounts use the same ownership restrictions.

`prisma/account-ownership.sql` records the hosted `account_ownership` migration. Apply it after the initial schema when provisioning another database. The `userId` columns are nullable only to preserve legacy records whose owner is unknown. These records are hidden from account queries; do not automatically assign them to the next account that signs in. A database administrator must establish the owner before assigning them. New API and seed records always receive the verified account's ID.

RLS policies provide additional protection for authenticated database access. Prisma uses a privileged connection, so the backend must continue filtering by account. The profile policy permits reading only the signed-in user's profile, with no client profile writes or role changes.

Run `bun run test:accounts` to check cross-account API isolation. Demo seeding through `/api/seed` remains administrator-only and seeds only that administrator's account. For CLI seeding, set `SEED_USER_ID` to an existing application `User.id` before running `bun run db:seed`; seeding without an owner fails.

## Finish the backend connection

1. Open the project's **Connect** dialog and select the **Session pooler** PostgreSQL connection string on port 5432. This works on IPv4 networks.
2. Put the full connection string in `SUPABASE_DATABASE_URL` in `backend/.env`. Replace the password placeholder with the database password, percent-encoding special characters. Do not use an API key as a database password.
3. Stop the backend and Prisma Studio, then run this from `backend/`:

```bash
bun run db:connect:supabase
```

The command checks that the URL belongs to the selected project, sets `schema=ecoprawn` and `sslmode=require`, and reads each table before updating `DATABASE_URL`. If verification fails, it leaves the existing connection unchanged. It saves the previous environment file in the ignored `.env.pre-supabase.local` file.

4. Restart the backend and Studio:

```bash
bun run dev
```

In a separate terminal:

```bash
bun run db:studio
```

The frontend continues calling the backend through `/api/*`.

## Database setup record

`prisma/supabase-schema.sql` records the initial cloud schema setup generated from the current Prisma schema, plus schema isolation and RLS. It has already been applied to this project as `create_ecoprawn_schema`. Do not rerun it against existing tables. Subsequent model changes should be reviewed and migrated separately.

Select the `ecoprawn` schema in Supabase's Table Editor to browse the imported records.

References: [Supabase Prisma setup](https://supabase.com/docs/guides/database/prisma), [RLS with no policies](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
