# EcoPrawn frontend

TanStack Start and React 19 frontend, served as a separate Node service.

Use Node 24+ and Bun 1.4.0. Run `bun install --frozen-lockfile`, then `bun run dev` on port 3000. Start the API separately in `../backend` on port 4000.

Set `BACKEND_URL` in `.env.local` or the server environment. It defaults to `http://localhost:4000` and is read at runtime for production. Browser requests remain same-origin under `/api/*`; the server forwards methods, bodies, cookies and redirects. Server secrets must never have a `VITE_` prefix.

`bun run build` generates `.output/`; `bun run start` starts the Node production server. Set `PORT` and `HOST` for a different bind address. Keep both services behind the same public frontend origin; the API's `APP_URL` must match it.

Routes live in `src/routes`, with generated `src/routeTree.gen.ts`. The root route owns metadata, theme initialization and global providers. Dashboard providers persist across nested route changes, including the USB connection. `src/start.ts` protects server-rendered dashboard requests and proxies the API. The dashboard route verifies client navigations through a server function. Refreshed session cookies and private no-store headers are preserved.

Run `bun run typecheck`, `bun run test:auth-proxy`, `bun run test:navigation`, `bun run test:tank-validation`, and `bun run test:responses`. Browser tests use Playwright; set `BROWSER_CHANNEL=msedge` to use installed Edge. Integration tests build an isolated production fixture and use mock services, never real accounts or paid SMS.
