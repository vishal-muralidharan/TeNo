---
name: maintain-design-system
description: Use this skill when you add or change tokens, global styles or shared UI primitives in teno. Defines the palette, type scale, spacing, radius and motion tokens.
---
<!-- build-forge:generated v1 body=8d6825eec5d1be572e546e99f22850590d3faae8110bed3cd91e3ffa1bb1a3c5 -->

<!-- Generated from .agents/project-profile.yaml by project-bootstrap. Edit the profile, then re-render. -->

# teno design system

All tokens live in `teno-web/src/index.css`.

## Blueprint

Query codebase design tokens on demand:
`python3 .agents/skills/project-blueprints/scripts/blueprint.py show --area tokens --paths <files>`

## Token rules

- No token rules recorded. Add them to the profile.

## Changing a token

1. Edit `teno-web/src/index.css` for every theme or mode.
2. Check contrast in each mode.
3. Update `README.md` if it lists tokens.
4. Run `cd teno-web && npm run test`.
<!-- BEGIN CUSTOM: notes -->
## Operational Guidelines
- **Dual-Theme Engine (`ThemeContext.jsx`):** Applied on `<html>` root via `data-theme` ("dark" | "light") and `data-style` ("minimal" | "modern").
- **Minimalist Theme Specification (`[data-style="minimal"]`):**
  - **Typography:** `'Fira Code'`, monospace (`var(--font-mono)`).
  - **Border Radius:** Strictly `0px` (`--border-radius: 0px`). Flat elevation with `box-shadow: none`.
  - **Action Buttons:** Bracket-enclosed monospaced text: e.g. `[ delete ]`, `[+ add_new]`, `[ shared ]`, `[ v1 ]`.
  - **Terminal Prefixes:** Section headings use `> ./<section_name>` and input prompts use `$_ ` or `> `.
  - **Prohibition of Graphical Icons:** Never render Lucide or SVG icons in Minimalist mode. All icons in `uiConfig.jsx` must evaluate to `null` for non-modern styles.
  - **Text Transform:** `lowercase` (`var(--text-transform): lowercase`).
- **Modern Theme Specification (`[data-style="modern"]`):**
  - **Typography:** `'Plus Jakarta Sans'`, `'Inter'`, sans-serif.
  - **Border Radius:** Rounded (`8px`, `12px`, `16px`). Layered card elevation and subtle blur.
  - **Buttons & Controls:** Tactile rounded buttons with Lucide SVG icons (`<Settings />`, `<Plus />`, etc.).
- **Translation Dictionary (`uiConfig.jsx` / `themeTranslations.js`):** Consume `getUiConfig(styleMode)` for all labels and icon slots; never hardcode mode-specific strings in JSX.
<!-- END CUSTOM: notes -->
