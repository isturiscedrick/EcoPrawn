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

The app lives in `frontend/`.

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

- Sensor readings, feed schedule, scan log, effluent log, and event log come from `src/data/ecoprawn.ts` and the default tank in `TankContext`.
- Trend charts are static illustrations.
- **Login is not wired to authentication.** Submitting the form navigates to `/dashboard` (see `useLoginForm.ts`).
- **The contact form does not send anything.** It is not connected to a mail service yet.
- The Water Quality page can connect an ESP32 over USB and save temperature and ultrasonic distance. Overview's Water Level gauge refreshes from those readings and uses distance until the tank is calibrated for percentage. USB stays connected when navigating between dashboard pages. See [ESP32 USB setup](hardware/README.md). Wi-Fi device authentication and the vision pipeline remain open work.

## Design tokens

Theme colors and shared tokens (`--water-deep`, `--mangrove`, `--coral`, `--sand`, shadows, radii) are defined in `frontend/src/app/globals.css`. Use these variables rather than hardcoding colors.