---
name: review-db-structure
description: Use this skill whenever you read, write or change data models, schemas, storage keys or payloads in teno. Lists the invariants and the items that need approval to change.
---
<!-- build-forge:generated v1 body=92ad8ea4d6035eeea1c4ab45c27106a0ebd2e10294ff983c339b9829ade2f910 -->

<!-- Generated from .agents/project-profile.yaml by project-bootstrap. Edit the profile, then re-render. -->

# Data rules for teno

## Blueprint

Query codebase data models and storage facts on demand:
`python3 .agents/skills/project-blueprints/scripts/blueprint.py show --area data --paths <files>`

Storage: Google Cloud Firestore in Datastore/Native mode shared across teno-web and teno-extension.
Schema source: `firestore.rules`. Read it before you change any data shape.

## Invariants

- Unified label architecture groups links, cart, reminders, and prompts.
- Shared labels synchronize member access via denormalized memberUids.
- Private user items are isolated under /users/{userId}.
- Prompt vault maintains immutable version history and prompt tags.
- Zero undefined field values allowed in Firestore payloads.

## Ask before changing

- Label memberUids and permissions
- User settings and private subcollections
- Prompt version schemas

## Rules

- Shared labels must maintain denormalized memberUids arrays across parent labels and child items. `[member-uids-denormalization]`
- Never write undefined to Firestore; sanitize payloads before writing. `[firestore-no-undefined]`
<!-- BEGIN CUSTOM: notes -->
## Canonical Database Architecture

```text
Firestore Root
├── /labels/{labelId}                           # Unified label grouping (links, cart, reminders, prompts)
├── /links/{linkId}                             # Root links collection (shared & unified links)
├── /prompts/{promptId}                         # Root prompts collection (LLM prompt vault & version control)
├── /cart_items/{itemId}                       # Shared cart items (root level)
├── /reminders/{reminderId}                     # Shared reminders (root level)
├── /users/{userId}                             # User profile & private subcollections
│   ├── /cart_items/{itemId}                    # Private user cart items
│   ├── /reminders/{reminderId}                 # Private user reminders
│   ├── /saved_links/{linkId}                   # Legacy private saved links
│   └── /settings/{settingDoc}                  # UI & ordering preferences
└── /system_config/feature_flags                # Feature flags (read: public, write: admin)
```

## Operational Guidelines
- **MemberUids Denormalization:** When a label is shared, all associated links, cart items, reminders, or prompts inherit the access list via denormalized `memberUids`. Any member additions or removals must synchronize `memberUids` across child items.
- **Client Symlink Integration:** `teno-extension/src/lib` is a symlink to `teno-web/src/lib`. Canonical database operations reside in `teno-web/src/lib/db.js` so both platforms stay strictly aligned.
- **Payload Sanitization:** Firestore rejects `undefined` values. Convert optional empty values to `null` or sanitize payloads before writing.
<!-- END CUSTOM: notes -->
