# Frontend styles

All application-wide styles are loaded through `globals.css`, imported once by
`src/routes/__root.tsx`. Do not import global styles from individual pages or
components.

## Structure and ownership

```text
styles/
├── globals.css
├── base/
│   └── foundations.css
├── themes/
│   └── theme-components.css
├── dashboard/
│   └── dashboard.css
├── marketing/
│   ├── marketing-overrides.css
│   ├── marketing-overrides/
│   │   ├── dark-theme-compat.css
│   │   └── landing-section-compat.css
│   ├── landing-global.css
│   ├── landing-global/
│   │   ├── tokens.css
│   │   ├── hero-lens.css
│   │   ├── forms-and-controls.css
│   │   ├── footer-layout.css
│   │   └── editorial-layout.css
│   └── public-site-theme.css
│       └── public-site-theme/
│           ├── landing-palette.css
│           ├── landing-header-drawer.css
│           ├── shared-page-header.css
│           └── card-interactions.css
├── responsive/
│   └── site-responsive.css
│       └── site-responsive/
│           ├── public-layout.css
│           ├── landing-mobile-layout.css
│           ├── landing-mobile-polish.css
│           └── dialogs-and-drawers.css
├── components/
│   ├── layout/
│   └── motion/
└── features/
    └── auth/
        ├── auth-modal.css
        └── auth-modal/
            ├── modal-base.css
            ├── form-layout.css
            ├── desktop-layout.css
            ├── brand-header.css
            └── mobile-sheet.css
```

| Area | Responsibility |
| --- | --- |
| `base/foundations.css` | Tailwind theme bridge, global tokens, typography, element defaults, shared motion primitives |
| `themes/theme-components.css` | Shared theme compatibility and theme mappings |
| `dashboard/dashboard.css` | Dashboard-only palette, layout safeguards, and responsive behavior |
| `marketing/landing-global/` | Public-site tokens, hero lens, forms, footer, and editorial composition |
| `marketing/marketing-overrides/` | Legacy public-page compatibility rules not yet safely migrated |
| `marketing/public-site-theme/` | Landing palette, landing header/drawer, shared page header, and card interactions |
| `responsive/site-responsive/` | Public layout, mobile landing layout/polish, and dialog/drawer constraints |
| `features/auth/auth-modal/` | Authentication modal base, form layout, desktop layout, brand header, and mobile sheet |
| `components/` | Styles owned by reusable layout and motion components |

The numbered filenames have been replaced with names that describe each
module's responsibility. The wrapper stylesheets remain stable entry points
and preserve the original module order.

## Global import order

Keep the order in `globals.css` intentional:

1. Framework imports (Google Fonts, Tailwind, animation utilities).
2. Base foundations.
3. Shared theme compatibility.
4. Dashboard-specific styles.
5. Legacy marketing compatibility.
6. Canonical public-page styles.
7. Responsive safeguards.
8. Final public-site theme refinements.
9. Component and feature styles.

Do not alphabetize these imports. Later styles intentionally refine or override
earlier compatibility rules. Within each wrapper, preserve its current
`@import` order. In particular, keep the landing palette before the shared
public-page theme rules and keep responsive safeguards before final theme
refinements.

## Refactoring rules

- Keep exactly one global entry point: `globals.css`.
- Never import global styles again from route components.
- Scope dashboard rules to `.dashboard-shell`.
- Scope public-page rules to the appropriate public-page root.
- Put new styles in the folder that owns the component or feature.
- Before deleting or merging rules, search the entire repository for their
  selectors, custom properties, and imports.
- Do not remove legacy rules merely because their filename says
  `compat` or `overrides`.
- Consolidate duplicate selectors only after comparing declarations,
  specificity, media/support conditions, and cascade order.
- Verify light/dark themes, desktop/mobile layouts, and reduced-motion behavior
  before changing visual declarations.
- Keep wrapper files focused on ordered imports; put actual CSS rules in the
  responsibility-specific modules.
