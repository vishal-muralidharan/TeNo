---
name: review-responsive-design
description: Use this skill when you build or audit layout in teno. Covers breakpoints, navigation by size, touch targets, safe areas and zoom.
---
<!-- build-forge:generated v1 body=17f9c1ce9a5b4efc36da27ea77bcad201e0bb1e751bfec6ab68fa613841d7f2c -->

<!-- Generated from .agents/project-profile.yaml by project-bootstrap. Edit the profile, then re-render. -->

# Responsive review for teno

Support 320px to 2560px. Touch targets are at least 44px on coarse pointers.

## Blueprint

Query codebase layout and breakpoint facts on demand:
`python3 .agents/skills/project-blueprints/scripts/blueprint.py show --area layout --paths <files>`

## Breakpoints

| From (px) | Layout |
|---|---|
| 320 | mobile dashboard, single column, bracketed actions, 16px font inputs |
| 600 | horizontal phone and tablet adjustments |
| 900 | multi-column desktop dashboard |
| 1200 | expanded desktop layout, dual-theme display |

## Rules

- Form inputs must enforce at least 16px font-size on mobile viewports (< 600px) to prevent iOS Safari auto-zoom. `[mobile-ios-input-16px]`
- Outer popup must enforce overflow hidden; only dedicated inner tab panes may scroll. `[extension-popup-no-outer-scroll]`

## Verify

Open the app at 320, 600, 900, 1200, 2560 px. For each screen check: no horizontal scroll, no hidden content, no layout shift.
<!-- BEGIN CUSTOM: notes -->
## Operational Guidelines
- **Web vs. Extension Viewport Foundations:**
  - `teno-web`: Responsive dashboard from 320px to 2560px. Modals bounded by `max-height: 85dvh` with `overflow-y: auto` and body scroll locking on open.
  - `teno-extension`: Fixed popup (~380–450px width, max 600px height). Outer popup body must enforce `overflow: hidden` to prohibit double scrollbars; inner `.tab-pane` content handles internal scrolling.
- **Mobile Input Auto-Zoom Prevention:** Form inputs must enforce at least `16px` font size on mobile screens (`max-width: 599px`) to prevent iOS Safari auto-zoom.
- **Card Geometry & Multi-Action Clearance:** Cards with multi-action bars or version history must enforce scalable column widths (`min-width: 350px`) and minimum heights (`145px`) to guarantee action clearance.
- **Zero Layout Shift:** Status transitions (`[ copied ]`, `[ saved ]`) must use fixed button widths or non-displacing absolute badges.
<!-- END CUSTOM: notes -->
