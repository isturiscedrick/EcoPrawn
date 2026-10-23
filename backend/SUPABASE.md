# Supabase connection

Project: `uzedgsewqhehhnddlvsh`.

The application tables live in the private `ecoprawn` schema. The existing local records were copied with their IDs, timestamps, and relationships intact. Row-level security is enabled on all eight tables with no client policies. Application access goes through the backend's PostgreSQL connection, not the browser Data API.

## Finish the backend connection

1. Open the project's **Connect** dialog and select the **Session pooler** PostgreSQL connection string on port 5432. This works on IPv4 networks.
2. Put the full connection string in `SUPABASE_DATABASE_URL` in `backend/.env`. Replace the password placeholder with the database password, percent-encoding special characters. Do not use an API key as a database password.
3. Stop the backend and Prisma Studio, then run this from `backend/`:

```bash
npm run db:connect:supabase
```

The command checks that the URL belongs to the selected project, sets `schema=ecoprawn` and `sslmode=require`, and reads each table before updating `DATABASE_URL`. If verification fails, it leaves the existing connection unchanged. It saves the previous environment file in the ignored `.env.pre-supabase.local` file.

4. Restart the backend and Studio:

```bash
npm run dev
```

In a separate terminal:

```bash
npm run db:studio
```

The frontend continues calling the backend through `/api/*`.

## Database setup record

`prisma/supabase-schema.sql` records the initial cloud schema setup generated from the current Prisma schema, plus schema isolation and RLS. It has already been applied to this project as `create_ecoprawn_schema`. Do not rerun it against existing tables. Subsequent model changes should be reviewed and migrated separately.

Select the `ecoprawn` schema in Supabase's Table Editor to browse the imported records.

References: [Supabase Prisma setup](https://supabase.com/docs/guides/database/prisma), [RLS with no policies](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
