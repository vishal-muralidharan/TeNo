---
name: build-ui
description: 'Use this skill whenever you build or change any UI in teno: screens, components, sheets, charts, copy. Covers shared components, tokens, required states, motion and accessibility.'
---
<!-- build-forge:generated v1 body=84d46d5f3fe4ea59a4eb5cd0a1efe88fadc25a8118ecd44a84e9d500d0a81768 -->

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

- No UI rules recorded. Add them to the profile.

## Finish

Run `cd teno-web && npm run test`.
<!-- BEGIN CUSTOM: notes -->
<!-- END CUSTOM: notes -->
