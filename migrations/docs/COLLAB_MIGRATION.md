# Collaboration Refactor — Migration Guide

This document covers all data migrations needed to move from the
**dedicated Shared Labels tab** (old schema) to the **native in-place
collaboration** system (new schema).

---

## 1. Add `type` field to existing `labels` docs

All labels created before this refactor lack a `type` field.
The frontend now queries `labels` filtered by `type == 'links' | 'cart' | 'reminders'`.
Without `type`, existing shared labels will be invisible in section headers.

### Script (Node.js / firebase-admin)

```js
// migrations/scripts/add_label_type.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = getFirestore();

async function run() {
  const snap = await db.collection('labels').get();
  const batch = db.batch();
  let count = 0;

  snap.docs.forEach(doc => {
    if (!doc.data().type) {
      // All pre-refactor labels were link-type shared labels
      batch.update(doc.ref, { type: 'links', updatedAt: new Date() });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Updated ${count} labels with type: 'links'`);
  } else {
    console.log('No labels needed updating.');
  }
}

run().catch(console.error);
```

**Run:**
```bash
FIREBASE_SERVICE_ACCOUNT="$(cat serviceAccount.json)" node migrations/scripts/add_label_type.js
```

---

## 2. Add `isShared` flag to existing shared `labels` docs

Pre-refactor labels in the `labels` collection were always shared (they were
created through the old SharedLabelsTab). Set `isShared: true` on them so the
share badge and invite link render correctly in the new UI.

```js
// In the same migration script or as a separate pass:
snap.docs.forEach(doc => {
  if (doc.data().isShared === undefined) {
    batch.update(doc.ref, { isShared: true, updatedAt: new Date() });
  }
});
```

---

## 3. (Optional) Migrate `users/{uid}/cart_items` to root `cart_items`

This is only needed for cart items you want to make shareable.
Private cart items can remain in the subcollection indefinitely.

When a user shares a cart label for the first time, new items they add
automatically go to the root `cart_items` collection. Existing private
items are unaffected.

### To migrate a specific user's cart items under a shared label:

```js
// For each shared cart label, copy private items to root with labelId + memberUids
const labelSnap = await db.collection('labels')
  .where('type', '==', 'cart')
  .where('ownerId', '==', OWNER_UID)
  .get();

for (const labelDoc of labelSnap.docs) {
  const label = labelDoc.data();
  const privateItems = await db
    .collection('users').doc(OWNER_UID)
    .collection('cart_items')
    .where('label', '==', label.name)
    .get();

  const batch = db.batch();
  privateItems.docs.forEach(item => {
    const newRef = db.collection('cart_items').doc();
    batch.set(newRef, {
      ...item.data(),
      labelId: labelDoc.id,
      ownerId: OWNER_UID,
      memberUids: label.memberUids,
    });
    // Optionally delete the old subcollection doc:
    // batch.delete(item.ref);
  });
  await batch.commit();
}
```

---

## 4. (Optional) Migrate `users/{uid}/reminders` to root `reminders`

Same pattern as cart items above, replacing `cart_items` with `reminders`
and `type: 'cart'` with `type: 'reminders'`.

---

## 5. Firestore Indexes required

Add the following composite indexes in `firestore.indexes.json` (or via
Firebase Console → Firestore → Indexes):

| Collection   | Fields                                | Query scope  |
|--------------|---------------------------------------|--------------|
| `labels`     | `type` ASC, `memberUids` ARRAY        | Collection   |
| `cart_items` | `memberUids` ARRAY, `createdAt` ASC   | Collection   |
| `reminders`  | `memberUids` ARRAY, `createdAt` ASC   | Collection   |
| `labels`     | `ownerId` ASC, `name` ASC, `type` ASC | Collection   |

Example `firestore.indexes.json` entry:
```json
{
  "collectionGroup": "labels",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "type",       "order": "ASCENDING" },
    { "fieldPath": "memberUids", "arrayConfig": "CONTAINS" }
  ]
}
```

---

## 6. Rollback

The old `shared_labels` and `shared_links` collections are preserved in
`firestore.rules`. To revert:

1. Restore `DashboardPage.jsx` from git (`feat: remove dedicated shared labels tab`)
2. Restore `firestore.rules` from the commit before `feat(rules): add root cart_items...`
3. No Firestore data needs to be deleted — old collections are untouched.

---

## Checklist

- [ ] Run `add_label_type.js` migration
- [ ] Run `isShared` migration patch
- [ ] Deploy updated `firestore.rules` via `firebase deploy --only firestore:rules`
- [ ] Add composite indexes via `firebase deploy --only firestore:indexes`
- [ ] Test invite link flow end-to-end in staging
- [ ] Verify share badge appears on existing shared labels
