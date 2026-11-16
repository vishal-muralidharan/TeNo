---
name: build-ui
description: 'Use this skill whenever you build or change any UI in teno: screens, components, sheets, charts, copy. Covers shared components, tokens, required states, motion and accessibility.'
---
<!-- build-forge:generated v1 body=0f9b3fa1bf051287efa24d1f5a4e872bad89f04bffa55b6d635f4af26c22bf3c -->

<!-- Generated from .agents/project-profile.yaml by project-bootstrap. Edit the profile, then re-render. -->

# How to build UI in teno

## Before you start

1. Look in `teno-web/src/components` for an existing primitive. Use it. Extend it if a variant is missing. Do not create one off copies.
2. Read the tokens in `teno-web/src/index.css`. Use only those.

## Blueprint

Query codebase UI facts on demand:
`python3 .agents/skills/project-blueprints/scripts/blueprint.py show --area ui --paths <files>`

## Form controls

1. Use the themed primitive.
2. If none exists, build it first in `teno-web/src/components`, reusing existing low level widgets, as its own commit with loading, empty and error states where they apply, then use it.
3. Never use a native browser control that a themed primitive covers.
4. Read the Form controls table with the blueprint show command for the ui area before choosing a control.

## Rules

- Use semantic HTML elements instead of generic divs with click handlers. `[a11y-semantic-html]`
- Interactive elements must display high-contrast visible focus indicators. `[a11y-visible-focus]`
- Text and interactive controls must meet WCAG AA contrast standards. `[a11y-aa-contrast]`
- Icon-only controls must provide an accessible text label. `[a11y-icon-button-labels]`
- Image tags must include an alt attribute on the same tag line. (enforced by test) `[a11y-img-has-alt]`
- Transitions and animations must respect prefers-reduced-motion media queries. `[motion-respect-reduced]`
- Smooth animations must target transform and opacity properties only. `[motion-transform-opacity-only]`
- Never use transition: all in stylesheets; target explicit CSS properties instead. (enforced by test) `[motion-no-transition-all]`
- Never use native browser date, time, month, week, datetime-local, or color inputs instead of the project's themed picker primitives. (enforced by test) `[ui-no-native-pickers]`
- Never use native browser select elements instead of the project's themed Select primitive. (enforced by test) `[ui-no-native-selects]`
- Never use window alert, confirm, or prompt instead of the project's dialog and toast primitives. (enforced by test) `[ui-no-browser-dialogs]`
- Loading views must use skeleton blocks matching content shape with no layout shift. `[ui-state-loading-skeleton]`
- Empty states must display an icon, 1 or 2 descriptive words, and an action. `[ui-state-empty-action]`
- Error views must display a short message with an icon and role="alert". `[ui-state-error-alert]`
- Never soften or break the Minimalist theme: zero border radius, bracketed text buttons, no graphical icons, lowercase text. `[dual-theme-minimalist-integrity]`

## Finish

Run `cd teno-web && npm run test`.
Check the screen at the widths listed in `review-responsive-design`.
<!-- BEGIN CUSTOM: notes -->
<!-- END CUSTOM: notes -->
