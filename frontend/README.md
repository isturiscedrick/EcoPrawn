# EcoPrawn — Next.js

AIoT-enabled indoor shrimp farming dashboard, migrated to Next.js (App Router).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the API service in `../backend` separately. Copy `.env.example` to `.env` if you need to change `BACKEND_URL`, which defaults to `http://localhost:4000`. Next.js forwards `/api/*` requests to that address. Restart the frontend after changing this setting, and set it before a production build.

Prisma, PostgreSQL credentials, and API handlers live in `../backend`. See [backend setup](../backend/README.md). The frontend keeps React state, API calls, display thresholds, and display logic. Operational records load through `/api/dashboard`; sample marketing readouts and form defaults come from `/api/demo`.

## Folder Structure

```text
src/
  app/                     Next.js pages, layouts, and styles
  components/
    ui/                    icons and dialogs
    layout/                site header, footer, and navigation
    motion/                reveal and scroll helpers
    illustrations/         decorative tank illustration
  features/
    dashboard/
      components/          dashboard widgets, sidebar, and add-tank form
      context/             dashboard data provider and tank mutations
      lib/                 thresholds and alert derivation
      *.tsx                dashboard views and layout
    about/, auth/, contact/, landing/
  content/site.ts          static website copy
  config/                  navigation and sensor display units
  hooks/                   backend demo-data hook
  types/                   UI and API contracts
  utils/                   shared class-name helper
public/assets/             images and logos
```

The frontend contains no sample records or Prisma imports. Backend fixtures live in `backend/src/data/demo.json`. From `backend/` run `npm run db:push` and `npm run db:seed` before starting the apps. The dashboard shows loading and connection errors instead of replacing missing data with dummy readings.

## Google sign-in

The login button starts Google OAuth through `/api/auth/google`. Supabase Auth handles Google identity, and the backend manages its session cookies through the existing API proxy. Dashboard middleware forwards refreshed cookies to the browser. Configure the backend using its [Google sign-in setup](../backend/README.md#google-sign-in). No Google secret belongs in frontend environment variables.
