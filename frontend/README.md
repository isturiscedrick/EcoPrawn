# EcoPrawn — Next.js

AIoT-enabled indoor shrimp farming dashboard, migrated to Next.js (App Router).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the API service in `../backend` separately. Copy `.env.example` to `.env` if you need to change `BACKEND_URL`, which defaults to `http://localhost:4000`. Next.js forwards `/api/*` requests to that address. Restart the frontend after changing this setting, and set it before a production build.

Prisma, PostgreSQL credentials, and API handlers live in `../backend`. See [backend setup](../backend/README.md). The frontend keeps React state, API calls, display thresholds, and mock data for its offline fallback.

## Folder Structure

```
src/
  app/            → routes (App Router): pages, layouts
  components/      → shared/reusable UI components
  features/        → feature-based modules (auth, dashboard)
  hooks/           → custom React hooks
  context/         → React context providers
  utils/           → helper/utility functions
  config/          → navigation & app-level constants
  data/            → static mock data
  types/           → shared TypeScript types
public/
  assets/          → images, logos
  icons/           → icon assets
```
