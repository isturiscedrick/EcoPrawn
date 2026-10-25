# EcoPrawn

**An AIoT-Enabled Indoor White Shrimp Farming & Water Management System**

EcoPrawn is a thesis project (Thesis Writing 1, CS 118, Computer Studies Department, University of Caloocan City, Congress Campus). It combines a water-quality sensor network, computer-vision growth tracking, automated feeding, and a biofloc loop that routes effluent to mangrove/wetland vegetation. This repository contains a marketing site, an operator dashboard, and a separate API backend.

## What the system covers

- **Water quality monitoring**: dissolved oxygen, pH, temperature, salinity, and water level
- **AI & computer vision**: growth, biomass, and abnormal-behavior tracking from camera feeds
- **Automated smart feeding**: scheduled, biomass-adjusted dispensing
- **Parameter-triggered control**: e.g. aerators activate when DO crosses its threshold
- **Biofloc & effluent management**: treatment loop with discharge routing

Out of scope: offshore farming, hatchery/breeding, off-grid energy independence, and automated harvesting. See the About page for details.

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing page |
| `/about` | Objectives, systems, and scope/limitations |
| `/contact` | Project details and contact form |
| `/login` | Operator sign-in |
| `/dashboard` | Tank overview (KPIs, sensor gauges, alerts, feed, vision) |
| `/dashboard/tanks` | Add, remove, and review tanks |
| `/dashboard/water` | Water quality readings and thresholds |
| `/dashboard/vision` | Vision & growth analytics |
| `/dashboard/feeding` | Feed schedule, progress, and allocation |
| `/dashboard/biofloc` | Biofloc loop and effluent routing log |
| `/dashboard/alerts` | Live parameter alerts and event log |

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router) with React 19
- TypeScript 5
- PostgreSQL with Prisma ORM in the backend
- Tailwind CSS 4 (`@tailwindcss/postcss`), `tw-animate-css`
- `clsx` + `tailwind-merge` (via `cn()` in `src/utils/cn.ts`)
- Fonts: Fraunces, Inter, IBM Plex Mono (Google Fonts)

## Getting started

The UI lives in `frontend/`. The API and Prisma ORM live in `backend/`.

Install and configure the backend first:

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`. Run `npm run db:push`, then `npm run dev` to start the API on port 4000. On Windows, `./setup-db.ps1` from the repository root can configure PostgreSQL and generate the client after dependencies are installed. See [backend setup](backend/README.md).

In a separate terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The frontend forwards `/api/*` requests to `http://localhost:4000`. Set `BACKEND_URL` in `frontend/.env` to use a different backend address. Restart the frontend after changing it, and set it before production builds. Run `npm run db:seed` in `backend` to populate demo data.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # next lint
```

Node 20.9 or newer is recommended (required by some of Next's and Tailwind's native dependencies).

> Both `package-lock.json` and `bun.lock` are committed. Use one package manager consistently.

## Project structure

```
frontend/
  public/assets/        logo and images
  src/
    app/                App Router routes, layouts, global CSS
    components/         shared layout, UI, motion, and illustrations
    features/           feature modules: landing, about, contact, auth, dashboard
    hooks/              API hooks for backend demo readouts
    config/             navigation config
    content/            marketing and About-page copy
    types/              shared TypeScript types
    utils/              shared cn() helper
backend/
  prisma/               PostgreSQL schema and repeatable seed script
  src/
    app/api/            dashboard, demo, tank, water, and seed endpoints
    data/demo.json       sample records and form defaults
    lib/prisma.ts       shared Prisma client
  .env.example          database connection template
```

## How the dashboard works

- **Tank state** lives in `TankContext`, which calls `/api/dashboard` through the frontend proxy. The backend reads and writes PostgreSQL through Prisma. Loading and connection errors are shown explicitly.
- **Target ranges** are defined in `src/features/dashboard/lib/thresholds.ts`:

  | Parameter | Target |
  | --- | --- |
  | Dissolved O₂ | ≥ 4.5 mg/L |
  | pH | 7.5 – 8.5 |
  | Temperature | 26 – 30 °C |
  | Salinity | 10 – 20 ppt |
  | Water level | ≥ 90% |

- **Alerts** for out-of-range readings are derived live in `src/features/dashboard/lib/alerts.ts` and shown above the logged events.

## Current limitations

The dashboard combines database-backed tanks with demo data and optional ESP32 USB testing:

- Tanks, telemetry, scans, growth history, feeding schedules, biofloc metrics, effluent logs, and alerts load from PostgreSQL through `/api/dashboard`. Run `npm run db:seed` in `backend/` to import sample records into an empty database. Existing tanks prevent reseeding.
- Trend charts use recorded samples and show an empty state when there are too few readings.
- Google sign-in protects the dashboard and operational API routes. Follow the [backend Google sign-in setup](backend/README.md#google-sign-in) before logging in.
- **The contact form does not send anything.** It is not connected to a mail service yet.
- The Water Quality page can connect an ESP32 over USB and save temperature and ultrasonic distance. Overview's Water Level gauge refreshes from those readings and uses distance until the tank is calibrated for percentage. USB stays connected when navigating between dashboard pages. See [ESP32 USB setup](hardware/README.md). Wi-Fi device authentication and the vision pipeline remain open work.

## Design tokens

Theme colors and shared tokens (`--water-deep`, `--mangrove`, `--coral`, `--sand`, shadows, radii) are defined in `frontend/src/app/globals.css`. Use these variables rather than hardcoding colors.
