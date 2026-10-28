# EcoPrawn

**An AIoT-Enabled Indoor White Shrimp Farming & Water Management System**

EcoPrawn is a thesis project (Thesis Writing 1, CS 118, Computer Studies Department, University of Caloocan City, Congress Campus). It combines a water-quality sensor network, computer-vision growth tracking, automated feeding, and a biofloc loop that routes effluent to mangrove/wetland vegetation. This repository contains the web frontend: a marketing site and an operator dashboard.

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
- Tailwind CSS 4 (`@tailwindcss/postcss`), `tw-animate-css`
- `clsx` + `tailwind-merge` (via `cn()` in `src/utils/cn.ts`)
- Fonts: Fraunces, Inter, IBM Plex Mono (Google Fonts)

## Getting started

The UI lives in `frontend/`. The API and Prisma ORM live in `backend/`.

Install and configure the backend first:

```bash
cd backend
bun install
```

Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`. Run `bun run db:push`, then `bun run dev` to start the API on port 4000. On Windows, `./setup-db.ps1` from the repository root can configure PostgreSQL and generate the client after dependencies are installed. See [backend setup](backend/README.md).

In a separate terminal from the repository root:

```bash
cd frontend
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

The frontend forwards `/api/*` requests to `http://localhost:4000`. Set `BACKEND_URL` in `frontend/.env` to use a different backend address. Restart the frontend after changing it, and set it before production builds. Run `bun run db:seed` in `backend` to populate demo data.

Other scripts:

```bash
bun run build   # production build
bun run start   # serve the production build
bun run typecheck # check TypeScript
```

Use Bun 1.4.0 for installs and scripts in both folders. Each app has its own `bun.lock`; use `bun install --frozen-lockfile` for reproducible installs. Next.js and Prisma CLI commands still use Node.js, so keep Node 20.9 or newer installed.

On Windows OneDrive checkouts, if `node_modules` contains empty package folders after installation, rerun the install with `bun install --frozen-lockfile --force --backend=copyfile` in the affected app folder.

## Project structure

```
frontend/
  public/assets/        logo and images
  src/
    app/                App Router routes, layouts, global CSS
    components/         shared UI (header, footer, icons, dashboard primitives)
    features/           feature modules: landing, about, contact, auth, dashboard
    context/            TankContext (tank state) and navigation hook
    hooks/              custom hooks (e.g. useLoginForm)
    config/             navigation config
    data/               static mock data
    types/              shared TypeScript types
    utils/              thresholds, alert derivation, cn()
```

## How the dashboard works

- **Tank state** lives in `TankContext` and is held in memory. Tanks added or removed on the Tanks page update every dashboard view, and tank status is derived from the thresholds below. State resets on page reload.
- **Target ranges** are defined in `src/utils/thresholds.ts`:

  | Parameter | Target |
  | --- | --- |
  | Dissolved O₂ | ≥ 4.5 mg/L |
  | pH | 7.5 – 8.5 |
  | Temperature | 26 – 30 °C |
  | Salinity | 10 – 20 ppt |
  | Water level | ≥ 90% |

- **Alerts** for out-of-range readings are derived live in `src/utils/alerts.ts` and shown above the logged events.

## Current limitations

The dashboard combines database-backed tanks with demo data and optional ESP32 USB testing:

- Tanks, telemetry, scans, growth history, feeding schedules, biofloc metrics, effluent logs, and alerts load from PostgreSQL through `/api/dashboard`. Run `bun run db:seed` in `backend/` to import sample records into an empty database. Existing tanks prevent reseeding.
- Trend charts use recorded samples and show an empty state when there are too few readings.
- Operator authentication supports username, mobile number with SMS verification, and Google sign-in to protect the dashboard and operational API routes. Follow the [backend setup](backend/README.md) and [phone auth setup](backend/PHONE-AUTH.md).
- **The contact form does not send anything.** It is not connected to a mail service yet.
- The Water Quality page can connect an ESP32 over USB and save temperature and ultrasonic distance. Overview's Water Level gauge refreshes from those readings and uses distance until the tank is calibrated for percentage. USB stays connected when navigating between dashboard pages. See [ESP32 USB setup](hardware/README.md). Wi-Fi device authentication and the vision pipeline remain open work.

## Design tokens

Theme colors and shared tokens (`--water-deep`, `--mangrove`, `--coral`, `--sand`, shadows, radii) are defined in `frontend/src/app/globals.css`. Use these variables rather than hardcoding colors.