# Frontend Stylesheet Architecture

This directory is the single source of truth for frontend CSS. Files are grouped by responsibility; the entry points at this level coordinate imports only.

## Folder structure

- `globals.css` — global entry point imported by `src/routes/__root.tsx`. Its import order is intentional.
- `landing-global.css` — public-page entry point for landing, About, Contact, and shared marketing styles.
- `foundations/` — Tailwind theme bridge, semantic tokens, typography, accessibility defaults, and shared theme components.
- `dashboard/` — dashboard shell, monitoring components, desktop/mobile layouts, and responsive module styles.
- `palette/` — shared brand utilities, light/dark surfaces, dashboard palette, marketing palette, and public/dashboard chrome palette layers.
- `marketing/` — landing, About, Contact, HeroLens, shared cards, illustrations, page layouts, and marketing responsive styles.
- `components/` — component-owned styles for the authentication modal, SiteHeader, BrandMark, and logo intro.
- `utilities/` — cross-page responsive and overflow safeguards.

## Import ownership

1. Import only `globals.css` from the TanStack root route.
2. Keep the original order of imports in `globals.css` and `landing-global.css`; cascade order is part of the design.
3. Keep shared Ocean Teal and Soft Coral Sand tokens in the palette foundation layers. Feature styles may consume tokens but should not redefine the shared brand palette.
4. Keep dashboard selectors scoped under `.dashboard-shell`.
5. Keep public-page selectors scoped under `.ep-landing`, `.ep-about-page`, or `.ep-contact-page`, except intentionally shared public chrome.
6. Component styles should be imported by the component that owns them, using the `@/styles/components/` path.
7. Edit the owning selector instead of appending corrective overrides. If a compatibility override is temporarily unavoidable, document why it exists and which rule it supersedes.
8. Preserve semantic status colors (success, warning, danger, and info); they are not brand accents.
9. Consolidate duplicate declarations only after checking specificity, source order, and media-query scope.

## Maintenance notes

- Keep stylesheet files focused on one responsibility.
- The 400-line target is a maintainability guideline, not a reason to split tightly coupled rules without checking selector dependencies and import order.
- Do not create new files in this root unless they are stylesheet entry points or architecture documentation.
- `marketing-overrides.css` is deprecated; do not add new rules to it.
