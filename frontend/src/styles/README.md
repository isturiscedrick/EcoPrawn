# Frontend Stylesheet Ownership & Architecture

This directory is the single source of truth for frontend CSS. Keep styles modular, preserve the established import order, and avoid adding corrective override blocks at the end of large files.

## Stylesheet map

- `globals.css` — global entry point imported by `src/routes/__root.tsx`.
- `foundations.css` — Tailwind theme bridge, semantic fallbacks, typography, shared chart defaults, and keyframes.
- `theme-components.css` — shared theme compatibility, surfaces, charts, and active-state components.
- `dashboard-foundations.css` — dashboard palette tokens, shell, sidebar, and responsive foundations.
- `dashboard-monitoring-core.css` — shared monitoring components, charts, motion, and accessibility rules.
- `dashboard-desktop-and-mobile-layout.css` — desktop workspace and core mobile dashboard composition.
- `dashboard-mobile-module-layouts.css` — responsive layouts for individual dashboard modules.
- `dashboard-mobile-modules.css` — responsive layouts for dashboard modules, filters, and tables.
- `dashboard-responsive-foundations.css` — shared mobile spacing, overflow, and status treatments.
- `dashboard-responsive-overview.css` — compact dashboard overview and KPI layouts.
- `dashboard-responsive-monitoring.css` — tank, sensor, alert, and trend-chart layouts.
- `dashboard-responsive-controls.css` — filters, tables, and feedback controls.
- `dashboard-responsive-page-chrome.css` — shared responsive page headers and navigation-adjacent layouts.
- `dashboard-responsive-finish.css` — final responsive card, typography, and consistency refinements.
- `palette-brand-utilities.css` — shared brand utilities and legacy utility-color mappings.
- `palette-dashboard-brand.css` — dashboard brand tokens and active navigation treatment.
- `palette-shared-brand-states.css` — shared hover, focus, and interaction brand states.
- `palette-surface-foundations.css` — light/dark base surfaces and public-page card mappings.
- `palette-theme-surfaces.css` — page canvases, headers, drawers, footers, and shared theme surfaces.
- `palette-surface-final-overrides.css` — final dark-mode and dashboard surface corrections.
- `palette-marketing-foundations.css` and `palette-marketing-composition.css` — public marketing and authentication palette hierarchy.
- `palette-public-depth.css` and `palette-public-contrast.css` — public hero depth, card contrast, and header/footer text contrast.
- `palette-dashboard-sidebar-foundations.css` and `palette-dashboard-sidebar-final-states.css` — dashboard sidebar and selected-navigation palette refinements.
- `palette-public-header.css` — desktop public header and navigation palette.
- `palette-mobile-public-chrome.css` — mobile public header, drawer, and footer palette.
- `palette-dashboard-mobile-header.css` — dashboard mobile header and alerts/avatar palette.
- `landing-global.css` — public-page stylesheet entry point.
  - `landing-tokens.css` — public-page tokens and headline treatments.
  - `hero-lens.css` — HeroLens depth, optics, and container-query behavior.
  - `landing-sections.css` — public hero, section bands, capabilities, and process layouts.
  - `site-chrome.css` — shared header/footer and public chrome.
  - `marketing-experience-foundations.css` and `marketing-experience-layout.css` — shared editorial foundations and page layouts.
  - `marketing-landing-interactions.css` — landing hero, CTA, and motion interactions.
  - `marketing-public-illustrations.css` — shared public-page illustrations and supporting visuals.
  - `marketing-shared-card-system.css` — shared card surfaces and About/Contact hero alignment.
  - `marketing-depth-foundations.css`, `marketing-depth-landing.css`, and `marketing-depth-pages.css` — original marketing visuals grouped by shared foundations, landing-page sections, and About/Contact refinements.
  - `mobile-first.css` — cross-page mobile-first responsive treatments.
- `site-header.css` — SiteHeader responsive layout.
- `brand-mark.css` — BrandMark and wordmark treatments.
- `logo-intro.css` — loading-screen intro animation.
- `auth-modal.css` — authentication dialog, mobile sheet, form controls, and theme states.
- `responsive-overrides.css` — cross-page viewport and overflow safeguards.
- `marketing-overrides.css` — deprecated compatibility entry; do not add new rules.

## Ownership and cascade rules

1. Import `globals.css` from the TanStack root route.
2. Treat the palette foundation modules as the authority for shared Ocean Teal and Soft Coral Sand tokens in light and dark themes; keep later palette modules in the documented cascade order. Feature styles may consume tokens but should not redefine the shared brand palette.
3. Keep dashboard selectors scoped under `.dashboard-shell`.
4. Keep public-page selectors scoped under `.ep-landing`, `.ep-about-page`, or `.ep-contact-page`, except for intentionally shared public chrome.
5. Edit the owning selector instead of appending a later corrective override. If a compatibility override is temporarily unavoidable, document why it exists and the rule it supersedes.
6. Preserve semantic status colors (success, warning, danger, and info); they are not brand accents.
7. Prefer one reduced-motion rule per component stylesheet and consolidate duplicate declarations into the owning rule.
8. Split stylesheets by responsibility when making larger refactors. The 400-line target is a maintainability guideline, not a reason to split tightly coupled rules without checking import order and selector dependencies.

## Current cleanup priorities

The large dashboard core, dashboard responsive, and palette stylesheets have been split into smaller feature-focused files. Each split preserves the original rule order and import position. The split preserves each original file's rule order and keeps the original import positions, so the cascade remains unchanged. Future cleanup should consolidate duplicate selectors only after checking specificity, source order, and media-query scope; do not delete repeated declarations based on matching property values alone.
