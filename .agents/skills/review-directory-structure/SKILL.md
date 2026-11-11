---
name: review-directory-structure
description: Use this skill to place new files or move files in teno. Describes each source layer and the root cleanliness rule.
---
<!-- build-forge:generated v1 body=a821df5fc10d2214194d23b32a93c8a4b8f45ac28567e07797aee4d8c52764e2 -->

<!-- Generated from .agents/project-profile.yaml by project-bootstrap. Edit the profile, then re-render. -->

# Directory structure of teno

| Path | Purpose |
|---|---|
| `teno-web/src` | Web application components, contexts, and pages |
| `teno-extension/src` | Chrome extension popup and background scripts |
| `migrations` | Database schema and migration scripts |

Tests: live in a tests folder.

## Root

Allowed in the repo root: `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `.firebaserc`. Put nothing else there.

## Before you add a file

Search first with `repo-search`. Reuse or extend an existing file when it fits.
<!-- BEGIN CUSTOM: notes -->
<!-- END CUSTOM: notes -->
