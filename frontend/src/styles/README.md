# Frontend Stylesheet Ownership & Architecture

This directory is the single source of truth and storage location for all CSS in the frontend. All stylesheets are modularized with single responsibilities and kept well under 400 lines to avoid monolithic cascade bloat.

## Directory Structure

```text
src/styles/
├── globals.css              # Global root entry point (imported by src/routes/__root.tsx)
├── foundations.css          # Tailwind v4 theme bridge, base tokens, typography, keyframes, touch targets
├── theme-components.css     # Theme compatibility rules, surfaces, charts, active item indicators
├── dashboard.css            # Dashboard shell brand palette tokens, monitoring layout, mobile drawer
├── landing-global.css       # Public marketing stylesheet index, importing:
│   ├── landing-tokens.css   # Canonical .ep-landing color tokens, overscroll, two-tone headlines
│   ├── hero-lens.css        # HeroLens 3D depth, 620x440 container queries, optics, instrument glass
│   ├── landing-sections.css # Business hero background, deep-water bands, capabilities, process grid
│   └── site-chrome.css      # Header contrast guards, SiteFooter container queries & themes, preview tilt
├── site-header.css          # SiteHeader responsive grid, mobile menu toggle button, label wrapping
├── brand-mark.css           # BrandMark SVG outline draw-on animation, theme transitions, wordmark
├── logo-intro.css           # Loading screen intro animation, orbit tracks, particles, progress bar
├── auth-modal.css           # Authentication dialog & mobile bottom sheet, segmented tabs, form inputs
├── responsive-overrides.css # Viewport boundaries, overflow clipping guards, text wrapping
└── marketing-overrides.css  # Deprecated compatibility notice (rules migrated to canonical files)
```

## Rules for Future Maintenance

- Import `globals.css` from the TanStack root route (`src/routes/__root.tsx`).
- Keep all CSS files inside `src/styles/`; do not scatter `.css` files into component or feature directories.
- Keep dashboard selectors scoped under `.dashboard-shell`.
- Keep public-page selectors scoped under `.ep-landing`, `.ep-about-page`, or `.ep-contact-page`.
- **Never append corrective overrides at the end of a stylesheet**; always edit the owning rule directly.
- Keep individual stylesheets modular and under 400 lines.
