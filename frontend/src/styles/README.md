# Frontend styles

All application-wide styles are loaded through `globals.css`, imported once by
`src/routes/__root.tsx`. Do not import these files from individual pages or
components.

## Folder ownership

| Folder / file | Owns |
| --- | --- |
| `globals.css` | Single global entry point and cascade order only |
| `base/foundations.css` | Tailwind theme bridge, base tokens, typography, global element defaults, and shared motion primitives |
| `themes/theme-components.css` | Shared theme compatibility plus dashboard and public-page theme mappings |
| `dashboard/dashboard.css` | Dashboard-only brand tokens, layout safeguards, and dashboard responsive rules |
| `marketing/marketing-overrides.css` | Legacy public-page compatibility rules not yet safely migrated |
| `marketing/landing-global.css` | Core public-site layout, hero, lens, and shared Landing/About/Contact styling |
| `marketing/public-site-theme.css` | Ordered landing-page palette, shared public-page themes, surfaces, and final card refinements |
| `responsive/site-responsive.css` | Ordered responsive safeguards, brand normalization, and shared layout corrections in one final cascade layer |

Feature-owned styles stay beside their feature. For example, authentication
modal styles live in `features/auth/auth-modal.css`. Component-specific styles
belong beside their component.

## Import order

The order in `globals.css` is intentional and must be preserved:

1. Framework imports (Google Fonts, Tailwind, animation utilities).
2. Base foundations.
3. Shared theme compatibility.
4. Dashboard-specific styles.
5. Legacy marketing compatibility.
6. Canonical public-page styles.
7. Responsive safeguards.
8. Combined public-site theme and final visual refinements (landing palette first, shared public-page rules second).

Do not alphabetize these imports. Later styles intentionally override earlier
compatibility rules. Keep the responsive layer before the combined public-site theme file. Inside
`marketing/public-site-theme.css`, preserve the landing palette before the
shared public-page theme rules.

## Refactoring rules

- Keep exactly one global entry point: `globals.css`.
- Never import global styles again from route components.
- Scope dashboard rules to `.dashboard-shell`.
- Scope public-page rules to `.ep-landing`, `.ep-about-page`,
  `.ep-contact-page`, or a documented shared public-page root.
- Put new styles in the folder that owns the component; do not append one-off
  overrides to unrelated stylesheets.
- Before deleting or merging rules, search the entire repository for their
  selectors, custom properties, and imports. Preserve specificity and cascade
  order when migrating declarations.
- Do not remove legacy rules merely because their filename says
  `overrides`; some still support older markup and theme behavior.
- Consolidate duplicate selectors only after comparing computed behavior and
  checking light mode, dark mode, desktop, mobile, and reduced-motion states.
- Remove an earlier rule block only when its selector, declarations, and conditional context are identical to a later block; keep the later copy so the final cascade remains authoritative.
