# Frontend stylesheet ownership

This directory is the single global stylesheet entry point for the frontend.

## Load order

`globals.css` is imported once by the TanStack root route. Keep feature styles out of page components so routes do not load the same global CSS more than once.

1. `foundations.css` — Tailwind theme bridge, base tokens, fonts, and global element defaults.
2. `theme-components.css` — shared theme compatibility rules and dashboard component theming.
3. `dashboard.css` — dashboard-only brand tokens and dashboard overrides.
4. `marketing-overrides.css` — compatibility overrides for older public-page class hooks. Keep selectors scoped; migrate these rules into the canonical public-page styles before deleting them.
5. `landing-global.css` — canonical EcoPrawn public-page tokens and shared landing/About/Contact hero and lens styling.

## Feature styles

Feature-specific styles belong beside the feature that owns them (for example, `features/auth/auth-modal.css`). Shared layout styles belong with their component under `components/`.

## Rules for future cleanup

- Import `globals.css` only from the root route.
- Do not import `landing-global.css` again from individual page components.
- Keep dashboard selectors under `.dashboard-shell`.
- Keep public-page selectors under `.ep-landing`, `.ep-about-page`, or `.ep-contact-page`.
- Before deleting a stylesheet, search the whole repository for its filename and its unique class names.
- Avoid appending corrective overrides at the end of a stylesheet; edit the owning rule instead.
