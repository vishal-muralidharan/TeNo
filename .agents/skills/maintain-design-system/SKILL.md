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
<!-- END CUSTOM: notes -->
