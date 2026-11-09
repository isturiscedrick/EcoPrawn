# Frontend Stylesheet Ownership & Architecture

This directory is the single global stylesheet entry point for the frontend. All stylesheets are modularized with single responsibilities and kept well under 400 lines to avoid monolithic cascade bloat.

## Load Order

`globals.css` is imported once by the TanStack root route (`src/routes/__root.tsx`).

1. `foundations.css` — Tailwind v4 theme bridge, base tokens, typography tokens, base layer elements, keyframes, and global touch/focus accessibility defaults.
2. `theme-components.css` — Theme compatibility rules, surfaces, charts, active item indicators, and component theming for the dashboard.
3. `dashboard.css` — Dashboard shell brand palette tokens, responsive monitoring layout, table scrolling, and mobile drawer styles.
4. `landing-global.css` — Public marketing stylesheet index, importing:
   - `landing-tokens.css` — Canonical `.ep-landing` color tokens (light & dark mode), overscroll backgrounds, smooth scroll padding, and brand two-tone headlines.
   - `hero-lens.css` — HeroLens 3D depth, responsive single-coordinate system (620x440 container queries), optics, and light/dark instrument glass finishes.
   - `landing-sections.css` — Business hero background, full-bleed `#readings` and `#systems` bands, capabilities cards, static 4-card `#process` grid, and About content frame.
   - `site-chrome.css` — Header contrast guards, `SiteFooter` container queries and themes, and interactive `.ep-hero-console` preview tilt.
5. `responsive-overrides.css` — Viewport boundaries, overflow clipping guards, text wrapping, and authentication modal responsive rules.

## Feature Styles

Feature-specific styles belong beside the feature that owns them (for example, `features/auth/auth-modal.css`). Shared component styles belong with their component under `components/layout/` (for example, `BrandMark.css`).

## Rules for Future Maintenance

- Import `globals.css` only from the root route.
- Do not import `landing-global.css` again from individual page components.
- Keep dashboard selectors scoped under `.dashboard-shell`.
- Keep public-page selectors scoped under `.ep-landing`, `.ep-about-page`, or `.ep-contact-page`.
- **Never append corrective overrides at the end of a stylesheet**; always edit the owning rule directly.
- Keep individual stylesheets modular and under 400 lines.
