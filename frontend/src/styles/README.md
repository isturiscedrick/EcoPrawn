# Frontend styles

All application-wide styles are loaded through `globals.css`, imported once by
`src/routes/__root.tsx`. Do not import these files from individual pages or
components.

## Stylesheet ownership

| File | Owns |
| --- | --- |
| `globals.css` | Global CSS entry point and import order only |
| `foundations.css` | Tailwind theme bridge, base design tokens, typography defaults, and global element styles |
| `theme-components.css` | Shared theme compatibility and dashboard component color fixes |
| `dashboard.css` | Dashboard-only brand tokens, layout safeguards, and dashboard responsive rules |
| `marketing-overrides.css` | Legacy public-page compatibility rules that have not yet been safely migrated |
| `landing-global.css` | Canonical public-site tokens and shared Landing, About, Contact, hero, and lens styling |
| `responsive-overrides.css` | Cross-page responsive safeguards for public pages and auth surfaces |

Feature-owned styles stay beside their feature. For example, authentication
modal styles live in `features/auth/auth-modal.css`. Component-specific styles
belong beside their component.

## Import order

1. Foundations and Tailwind theme bridge.
2. Shared theme compatibility.
3. Dashboard-specific styles.
4. Legacy marketing compatibility.
5. Canonical public-page styles.
6. Responsive safeguards, last, so breakpoint rules can adapt the completed
   component styles.

Keep this order until the legacy marketing rules have been audited and migrated.

## Cleanup rules

- Keep exactly one global entry point: `globals.css`.
- Never import `landing-global.css` or `responsive-overrides.css` again from
  route components.
- Scope dashboard rules to `.dashboard-shell`.
- Scope public-page rules to `.ep-landing`, `.ep-about-page`,
  `.ep-contact-page`, or a documented shared public-page root.
- Put new styles in the file that owns the component; do not append one-off
  overrides to the bottom of unrelated stylesheets.
- Before deleting or merging a stylesheet, search the entire repository for
  its import, unique selectors, and custom properties. Preserve cascade order
  when migrating rules.
- Do not remove legacy rules merely because their filename says "overrides";
  some still support older markup and theme behavior.
