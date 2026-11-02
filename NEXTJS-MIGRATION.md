# Next.js to TanStack migration inventory

Original inventory: 2026-11-02. The inventory below describes the pre-migration application. Both services now use TanStack Start; see the app READMEs for current commands and configuration. The selected architecture keeps separate frontend and API services on Bun 1.4.0, using TanStack Start, Vite and Nitro. Existing HTTP contracts and database schema are retained.

## Current applications

- `frontend/` is a Next.js 15 App Router application on port 3000, with React 19. `frontend/next.config.ts` enables React strict mode and rewrites `/api/:path*` to `BACKEND_URL` (default `http://localhost:4000`). Browser calls use same-origin `/api` URLs. The backend URL is also used directly by frontend middleware.
- `backend/` is a separate Next.js 15 application on port 4000, exposing App Router route handlers. Its config enables strict mode and selects `.next-dev` in development, `.next` otherwise, or `NEXT_BUILD_DIR` when set. Preserve separate build output for concurrent test servers if needed.
- Both `package.json` files use Next CLI for `dev`, `build`, and `start`; both have separate Bun lockfiles. Both `tsconfig.json` files include the Next TypeScript plugin, generated `.next` types and `next-env.d.ts`, and define `@/*` as `src/*`. Backend also includes `.next-dev` and `.next-auth-test` types. Replace these as part of the toolchain switch, preserving aliases and type checking.
- `frontend/public/assets/`, `frontend/src/app/favicon.ico`, `icon.svg`, `globals.css`, and `postcss.config.mjs` depend on current asset, document, and CSS conventions. Preserve public URLs, icons, Tailwind/PostCSS processing and global CSS.

## Frontend routes and layouts

All page files are under `frontend/src/app/`. Preserve URLs and direct-load behavior:

| URL | Files or behavior |
| --- | --- |
| `/`, `/about`, `/contact`, `/login` | `page.tsx`, `about/page.tsx`, `contact/page.tsx`, `login/page.tsx` |
| `/dashboard` | `dashboard/page.tsx` |
| `/dashboard/activity`, `/alerts`, `/biofloc`, `/feeding`, `/profile`, `/tanks`, `/vision`, `/water` | `dashboard/<name>/page.tsx` (all paths prefixed `/dashboard`) |

`app/layout.tsx` defines document language, metadata, global CSS, the early theme script, `LogoIntroGate`, and `AuthModalProvider`. Keep the theme script early enough to avoid a theme flash. `dashboard/layout.tsx` nests `ToastProvider`, `TankProvider`, `Esp32Provider`, and `SystemLayout`. Preserve provider lifetime across dashboard navigation, especially the ESP32 USB connection. `dashboard/loading.tsx` and each dashboard child `loading.tsx` provide Next loading boundaries; map their actual UI and behavior to router pending boundaries. `dashboard/activity/page.tsx` and many components have `"use client"` directives, which currently mark Next client boundaries. Review SSR and browser-only access before removing these directives; they are not a substitute for SSR safety in another framework.

## Navigation and frontend security

- `next/link` appears in `features/landing/LandingPage.tsx`, `components/CtaBand.tsx`, `components/layout/{SiteHeader,SiteFooter,NavLinks}.tsx`, `features/auth/AuthModalProvider.tsx`, and `features/dashboard/components/{Sidebar,SidebarNavItem}.tsx`. `next/navigation` `usePathname` appears in `components/motion/LogoIntroGate.tsx`, `components/layout/SiteHeader.tsx`, and `features/dashboard/components/Sidebar.tsx`. Map links, active pathname logic, anchor behavior, and accessibility to the selected router.
- `SidebarNavItem.tsx` uses `useLinkStatus`, `prefetch={!active}`, pending indicators, and `aria-busy`. Preserve prefetch behavior and immediate pending feedback; the existing production navigation test asserts both.
- `frontend/src/middleware.ts` matches `/dashboard/:path*`. It calls backend `/api/auth/session` with the incoming Cookie header, `no-store`, and a 15-second timeout. A 401 redirects to `/login`; other unsuccessful responses or network errors return 503. It appends every upstream `Set-Cookie` header and sets `Cache-Control: private, no-store`. A replacement must run on direct requests and protected navigations, propagate all cookie chunks, and fail closed. Client-only route guards do not by themselves protect server-rendered responses. Backend authorization remains necessary independently.
- Login, logout, expiry, and Google auth also use full-page `window.location` navigation in `LoginForm.tsx`, `Sidebar.tsx`, and dashboard `TankContext.tsx`; preserve these flows and query-string errors. Client fetches depend on the same-origin API proxy, including cookies, methods, request bodies, response status, redirects, and multiple `Set-Cookie` headers. Provide an equivalent production proxy as well as development routing, or consciously redesign the origin/cookie contract.

## Backend routes

All paths below are relative to `backend/src/app/api/`. Keep method, URL, status, body, header, authorization, and side-effect contracts when moving handlers. Several handlers already use standard `Request` and `Response`; others use `NextResponse.json`.

| Path | Methods |
| --- | --- |
| `/api/auth/google` | GET |
| `/api/auth/google/callback` | GET |
| `/api/auth/logout` | POST |
| `/api/auth/password` | POST |
| `/api/auth/session` | GET |
| `/api/dashboard` | GET |
| `/api/demo` | GET |
| `/api/hardware` | GET, POST |
| `/api/seed` | POST |
| `/api/sms/settings` | GET, PATCH |
| `/api/sms/test` | POST |
| `/api/sms/webhook` | POST |
| `/api/tanks` | GET, POST |
| `/api/tanks/[id]` | GET, PATCH, DELETE |
| `/api/water` | GET, POST |

`[id]/route.ts` receives Next 15's asynchronous `params`; adapt the parameter interface. `backend/src/middleware.ts` matches `/api/:path*` and applies `Cache-Control: private, no-store`, `Pragma: no-cache`, and `Expires: 0`. Ensure equivalent headers on all API responses, including errors and redirects.

`backend/src/lib/auth.ts` uses async `next/headers` `cookies()` and `headers()` for Supabase SSR session reads and updates, verified users, origin checks, and account access. Its cookie options include HttpOnly, Secure selection, SameSite=Lax and path `/`. Auth handlers also use Next response cookies and redirects; the Google callback uses `NextRequest.nextUrl`, PKCE cookies, redirect query errors, and clears legacy cookies. Logout clears Supabase and legacy cookies. Replace request-context and response-cookie APIs with an explicitly request-scoped equivalent, retaining multiple Set-Cookie headers, refresh, PKCE, origin checks, account isolation, and no-store headers. Do not expose server credentials to the browser. Prisma, Supabase, SMS, and hardware business logic need not be rewritten solely for routing, but their runtime and environment requirements must be supported by the chosen server adapter.

## Tests and migration checks

- `frontend/scripts/test-auth-proxy.mjs` imports Next's internal config loader and CLI and runs a Next server; migrate it to exercise the replacement production proxy and cookie forwarding.
- `frontend/scripts/test-navigation.mjs` builds and starts Next, detects `_rsc` and `next-router-prefetch`, and checks prefetch, fast warm navigation, immediate cold pending feedback, and expired-session redirect. Rewrite protocol-specific assertions while retaining behavioral checks and the slow-auth scenario.
- `backend/scripts/test-auth.mjs` starts Next directly with `NEXT_BUILD_DIR=.next-auth-test`. Backend `test-account-isolation.mjs`, `test-api-validation.mjs`, `test-oxygen.mjs`, and `test-sms.mjs` mock `next/server`; update mocks or test through the new request adapter. Other package scripts should continue to pass without live services unless explicitly marked live.
- Check direct loads and navigation for every page, nested provider persistence, loading states, theme initialization, assets, metadata, and responsive UI. Exercise proxy methods, query strings, redirects and multiple cookies; test authenticated, expired, unavailable, and slow session service cases. Cover OAuth callback, logout, origin rejection, account isolation, API errors, and cache headers. Run both builds, typechecks, and relevant existing tests. The live oxygen test writes database records and may send paid SMS; do not treat it as a routine test.

## Decisions and suggested order

1. Decide whether both applications move, whether the API stays separate, the SSR requirements, deployment runtime, and how `/api` reaches the backend in production. Choose versions and verify current TanStack documentation before selecting adapters.
2. Capture baseline behavior using the existing tests. Introduce the new build and routing setup with the existing URL and layout tree, then migrate navigation, pending UI, and static assets.
3. Port the session gate and proxy with integration coverage before relying on protected pages. Migrate backend handlers and request-scoped auth together, preserving all cookies and headers. Keep server-only code and secrets on the server.
4. Replace Next-specific test harnesses and configuration, run the full relevant checks, then remove Next packages, generated types, lockfile entries, and obsolete docs. Update root and app READMEs with actual commands and deployment configuration.

Search used for this inventory: Next imports and CLI references, App Router files, middleware, request APIs, config, TypeScript settings, and test scripts. Re-run `rg -n 'next/|NextRequest|NextResponse|next dev|next build|next start|NEXT_|use client' frontend backend -g '!bun.lock'` during migration to find remaining references. Lockfiles and generated output were not treated as application code.
