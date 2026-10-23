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
npm run dev
```

On Windows, you can instead run `./setup-db.ps1` from the repository root after installing dependencies. Stop backend development servers before generating the Prisma client or changing the database schema. Restart the backend after changing `.env`.

The API listens on [http://localhost:4000](http://localhost:4000). Run the frontend separately on port 3000. Its `/api/*` requests are forwarded here by `frontend/next.config.ts`.

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| `/api/tanks` | GET, POST | List or create tanks |
| `/api/tanks/:id` | GET, PATCH, DELETE | Read, update or delete a tank |
| `/api/water` | GET, POST | Read or record telemetry, with optional `tankId` query filter |
| `/api/seed` | GET | Populate demo data when there are no tanks |

Visit `/api/seed` once during local setup to populate demo data. This endpoint writes to the database and retains its existing behavior.

Use `npm run build` and `npm start` for production, `npm run typecheck` to check TypeScript, and `npm run db:studio` to browse the database. Deploy this service separately and set the frontend's `BACKEND_URL` before building the frontend. Keep database credentials in this backend only.
