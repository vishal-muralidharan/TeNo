---
name: review-directory-structure
description: Use this skill to place new files or move files in teno. Describes each source layer and the root cleanliness rule.
---
<!-- build-forge:generated v1 body=1a0b37188a17d87205c16dd1f3ac9a9ed1104e73acf7a71bb1fcca9bfe176494 -->

<!-- Generated from .agents/project-profile.yaml by project-bootstrap. Edit the profile, then re-render. -->

# Directory structure of teno

| Path | Purpose |
|---|---|
| `teno-web/src` | Web application components, contexts, and pages |
| `teno-web/api` | Web serverless functions and API routes |
| `teno-web/sm` | Screen-space typing caret module |
| `teno-extension/src` | Chrome extension popup and background scripts |
| `teno-extension/sm` | Extension typing caret module |
| `migrations` | Database schema and migration scripts |

Tests: live in a tests folder.

## Root

Allowed in the repo root: `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `.firebaserc`. Put nothing else there.

## Before you add a file

Search first with `repo-search`. Reuse or extend an existing file when it fits.
<!-- BEGIN CUSTOM: notes -->
<!-- END CUSTOM: notes -->
