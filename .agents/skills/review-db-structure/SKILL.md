---
name: review-db-structure
description: >-
  Use this skill whenever reading, writing, modifying, or refactoring database collections,
  documents, fields, or Firestore security rules in TeNo. Ensures strict alignment with the canonical
  schema, prevents undefined field errors, enforces security rules constraints, and maintains memberUids denormalization.
---

# Review Database Structure

This skill defines the canonical database architecture, document schemas, security constraints, and modification checklist for the **TeNo** repository. Use it whenever implementing or updating any feature that touches Firestore, serverless endpoints, or mock storage.

---

## 1. Canonical Database Architecture

TeNo uses Google Cloud Firestore in Datastore / Native mode with a unified label architecture supporting both private data and shared multi-user collaboration.

```text
Firestore Root
├── /labels/{labelId}                           # Unified label grouping (links, cart, reminders)
├── /links/{linkId}                             # Root links collection (shared & unified links)
├── /cart_items/{itemId}                       # Shared cart items (root level)
├── /reminders/{reminderId}                     # Shared reminders (root level)
├── /users/{userId}                             # User profile & private subcollections
│   ├── /cart_items/{itemId}                    # Private user cart items
│   ├── /reminders/{reminderId}                 # Private user reminders
│   ├── /saved_links/{linkId}                   # Legacy private saved links
│   └── /settings/{settingDoc}                  # UI & ordering preferences
│       ├── ui                                  # { styleMode, theme, etc. }
│       └── labels_{collectionName}             # { order: [labelNames...] }
├── /system_config/feature_flags                # Feature flags (read: public, write: admin)
└── /shared_labels / /shared_links              # Legacy schema (read/write preserved for rollback)
```

---

## 2. Collection Schemas & Field Shapes

### 1. `/labels/{labelId}`
A label acts as a grouping tag across Links, Cart, or Reminders. When a label is shared, all associated items inherit its access list via denormalized `memberUids`.
* **Security Rules:**
  - `read`: Member of label (`request.auth.uid in resource.data.memberUids` or `members` map) OR `ownerId == request.auth.uid`.
  - `create`: Authenticated user creating label where `ownerId == request.auth.uid`.
  - `update`: Any member can update (role updates, `isShared` toggle, `inviteToken`).
  - `delete`: Only original label `ownerId`.
* **Fields:**
  - `name` (string): Label display name (e.g. `"kitchen"`, `"reading-list"`).
  - `type` ("links" | "cart" | "reminders"): Module category.
  - `ownerId` (string): UID of creator.
  - `isShared` (boolean): Flag indicating whether sharing / invite link is active.
  - `inviteToken` (string | null): Unique token generated for invite URLs.
  - `visibility` ("private" | "shared"): Display visibility state.
  - `memberUids` (array<string>): Array of all member UIDs (must include `ownerId`).
  - `members` (map<string, MemberInfo>): Keyed by UID with:
    - `role` ("owner" | "editor" | "viewer"): RBAC permission role.
    - `name` (string): Member display name or email prefix.
    - `email` (string): Member email address.
    - `joinedAt` (Timestamp): Timestamp when user joined.
  - `createdAt` (Timestamp): Server creation timestamp.
  - `updatedAt` (Timestamp): Server update timestamp.

### 2. `/links/{linkId}`
Root links collection used for both shared links and default private links.
* **Security Rules:**
  - `read`, `update`, `delete`: Allowed if user is in `memberUids`.
  - `create`: Allowed if `ownerId == request.auth.uid` AND user is in `memberUids`.
* **Fields:**
  - `url` (string): Target website URL.
  - `altUrl` (string | null): Optional secondary URL (e.g. alternate product retailer).
  - `nickname` (string): Bookmark title or nickname.
  - `description` (string | null): Optional bookmark notes or description.
  - `label` (string): Associated label name.
  - `labelId` (string): ID of parent label doc in `/labels/`, or `default_${uid}`.
  - `ownerId` (string): UID of creator.
  - `memberUids` (array<string>): Denormalized array of member UIDs matching parent label.
  - `createdAt` (Timestamp): Server timestamp.
  - `updatedAt` (Timestamp): Server timestamp.

### 3. `/cart_items/{itemId}` (Root Shared Collection)
Stores cart items for shared labels. Private cart items reside in `/users/{userId}/cart_items`.
* **Security Rules:**
  - `read`, `update`, `delete`: Allowed if `request.auth.uid in resource.data.memberUids`.
  - `create`: Allowed if `ownerId == request.auth.uid` and user is in `memberUids`.
* **Fields:**
  - `text` (string): Item description or title.
  - `url` (string | null): Optional purchase / reference URL.
  - `price` (string | number | null): Optional price tracking.
  - `completed` (boolean): Purchased / resolved state.
  - `label` (string): Label name.
  - `labelId` (string): ID of parent label in `/labels/`.
  - `ownerId` (string): UID of creator.
  - `memberUids` (array<string>): Synced from parent label.
  - `createdAt` (Timestamp).

### 4. `/reminders/{reminderId}` (Root Shared Collection)
Stores reminders for shared labels. Private reminders reside in `/users/{userId}/reminders`.
* **Security Rules:**
  - Same as root `cart_items`.
* **Fields:**
  - `text` (string): Reminder or task description.
  - `completed` (boolean): Done state.
  - `label` (string): Label name.
  - `labelId` (string): ID of parent label in `/labels/`.
  - `ownerId` (string): UID of creator.
  - `memberUids` (array<string>): Synced from parent label.
  - `createdAt` (Timestamp).

### 5. `/users/{userId}`
* **Security Rules:**
  - `read`, `create`: Owner only (`request.auth.uid == userId`).
  - `update`: Owner only, write-locked for administrative fields (`subscription`, `isAdmin`, `words_*`).
  - `delete`: Prohibited via client rules (handled securely via serverless `api/delete-account.js`).
  - Subcollections: Fully accessible by document owner (`match /{document=**} { allow read, write: if isOwner(userId); }`).

---

## 3. Strict DB Implementation Guardrails

1. **Never pass `undefined` to Firestore:**
   Firestore's Web SDK throws `Unsupported field value: undefined` when any field in an object or array passed to `setDoc`, `addDoc`, or `updateDoc` is `undefined`. Always sanitize payload objects with `null` or explicit defaults:
   ```javascript
   altUrl: altUrl || null,
   description: description || null,
   inviteToken: inviteToken || null,
   ```

2. **Denormalized `memberUids` Consistency:**
   Firestore security rules rely on `request.auth.uid in resource.data.memberUids` for lightning-fast evaluations without parent collection lookups.
   - When adding an item to a shared label, ensure `memberUids` is copied from the parent label.
   - When a new member joins via `api/joinLabel.js`, the serverless function executes an atomic batch write to append `uid` to the label doc AND all items in `links`, `cart_items`, and `reminders` sharing that `labelId`.

3. **Use the `TeNoDatabase` Wrapper Class:**
   All client database interactions in `teno-web` must use the `TeNoDatabase` helper (`src/lib/db.js`) rather than writing ad-hoc Firestore calls in React components. This centralizes schema versioning, subscription cleanup, and fallback handling.

4. **Label Deletion Handling:**
   When deleting a label, provide clear handling options:
   - Option A: Delete label and delete all items belonging to it (`batchDeleteSharedLabelAndLinks`).
   - Option B: Delete label and ungroup items (clearing `labelId`).

5. **Client vs Admin Operations:**
   Account deletion and invite acceptance require cross-user or administrative privileges. Never attempt these operations directly from client components; invoke the corresponding serverless endpoints (`api/joinLabel.js`, `api/delete-account.js`).

---

## 4. DB Change Checklist

Before committing any DB-related change, verify:
- [ ] No `undefined` values in Firestore payloads (sanitize with `null` or default fallbacks).
- [ ] Denormalized `memberUids` updated across related collections if membership changes.
- [ ] Security rules in `firestore.rules` accommodate the query/mutation patterns.
- [ ] Changes mediated through `TeNoDatabase` in `teno-web/src/lib/db.js`.
- [ ] Targeted tests in `teno-web/tests/lib/db.test.js` or `teno-web/tests/api/` pass cleanly.
