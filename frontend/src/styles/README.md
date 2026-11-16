# Frontend Stylesheet Ownership & Architecture

This directory is the single source of truth for frontend CSS. Keep styles modular, preserve the established import order, and avoid adding corrective override blocks at the end of large files.

## Stylesheet map

- `globals.css` — global entry point imported by `src/routes/__root.tsx`.
- `foundations.css` — Tailwind theme bridge, semantic fallbacks, typography, shared chart defaults, and keyframes.
- `theme-components.css` — shared theme compatibility, surfaces, charts, and active-state components.
- `dashboard.css` — dashboard shell tokens, monitoring layouts, and responsive dashboard rules.
- `palette-system.css` — canonical shared brand tokens and light/dark semantic palette mapping.
- `landing-global.css` — public-page stylesheet entry point.
  - `landing-tokens.css` — public-page tokens and headline treatments.
  - `hero-lens.css` — HeroLens depth, optics, and container-query behavior.
  - `landing-sections.css` — public hero, section bands, capabilities, and process layouts.
  - `site-chrome.css` — shared header/footer and public chrome.
  - `marketing-experience.css`, `marketing-depth.css`, and `mobile-first.css` — existing public experience, depth, and responsive treatments; migrate rules into their owning modules before removing these files.
- `site-header.css` — SiteHeader responsive layout.
- `brand-mark.css` — BrandMark and wordmark treatments.
- `logo-intro.css` — loading-screen intro animation.
- `auth-modal.css` — authentication dialog, mobile sheet, form controls, and theme states.
- `responsive-overrides.css` — cross-page viewport and overflow safeguards.
- `marketing-overrides.css` — deprecated compatibility entry; do not add new rules.

## Ownership and cascade rules

1. Import `globals.css` from the TanStack root route.
2. Treat `palette-system.css` as the authority for shared Ocean Teal and Soft Coral Sand tokens in light and dark themes. Feature styles may consume tokens but should not redefine the shared brand palette.
3. Keep dashboard selectors scoped under `.dashboard-shell`.
4. Keep public-page selectors scoped under `.ep-landing`, `.ep-about-page`, or `.ep-contact-page`, except for intentionally shared public chrome.
5. Edit the owning selector instead of appending a later corrective override. If a compatibility override is temporarily unavoidable, document why it exists and the rule it supersedes.
6. Preserve semantic status colors (success, warning, danger, and info); they are not brand accents.
7. Prefer one reduced-motion rule per component stylesheet and consolidate duplicate declarations into the owning rule.
8. Split stylesheets by responsibility when making larger refactors. The 400-line target is a maintainability guideline, not a reason to split tightly coupled rules without checking import order and selector dependencies.

## Current cleanup priorities

The public and dashboard stylesheets contain legacy layered rules and exceed the preferred module size. Refactor incrementally: identify the winning declaration, move rules into their owning module, compare light/dark behavior, then remove the superseded rule. Avoid bulk deletion based only on repeated property values because selector specificity, source order, and media-query scope can change the result.
