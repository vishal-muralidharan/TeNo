# TeNo Unified Schema: Rollout & Execution Plan

This document outlines the chronological procedure required to safely execute the database migration from the old `users/{uid}/saved_links` architecture to the new unified `labels` and `links` architecture in production.

## 1. Credentials Setup (Admin SDK)

Before running the data migration script, ensure you have the proper credentials to bypass Firestore Security Rules (since the rules do not allow you to read all users' data normally).

**Option A (Recommended): Application Default Credentials**
1. Install the Google Cloud CLI (`gcloud`).
2. Run the following command in your terminal and log in with the Google account associated with the Firebase project:
   ```bash
   gcloud auth application-default login
   ```
3. Update `migrations/data/001_migrate_to_unified_schema.js` to use `admin.credential.applicationDefault()` instead of the local JSON file.

**Option B (Current): Local Service Account JSON**
Ensure your `service-account.json` file is present in `scripts/migration/` (as it currently is on your local machine) since the script is hardcoded to look for it there. Do **not** commit this file.

## 2. Deploy New Security Rules

Before migrating the data, we must deploy the new rules to ensure any newly written data is properly secured. The new rules already contain backwards-compatibility for the old read/write paths just in case.

Run the following command from the project root:
```bash
firebase deploy --only firestore:rules
```

## 3. Execute Data Migration

With the credentials set up and the rules deployed, you can safely run the migration script.

1. Navigate to the `migrations/data` directory (or run it from the root):
   ```bash
   node migrations/data/001_migrate_to_unified_schema.js
   ```
2. Monitor the terminal output. It will log progress batch-by-batch.
3. **Safety Check:** The script is strictly additive. It will NOT delete any data from the old `users/{uid}/saved_links` collections. If the script fails halfway through, you can safely run it again (though you may get duplicate documents if it failed *after* a batch commit; testing on a staging environment first is recommended).

## 4. Deploy Frontend

Once the data is successfully copied to the root `labels` and `links` collections, deploy your updated frontend code (which has been refactored to point to the new unified paths).

```bash
# Assuming standard frontend deployment (e.g., via Vercel, Firebase Hosting, etc.)
npm run build
firebase deploy --only hosting
```
*Note: Depending on your hosting provider, pushing to the `main` branch might trigger this automatically.*

## 5. Cleanup Phase (Post-Rollout)

Do **NOT** delete the old `saved_links` subcollections immediately. Wait for at least 1-2 weeks to ensure the new architecture is stable and no users are reporting missing data.

Once you are confident the system is stable:
1. Create a new cleanup script (e.g., `migrations/data/002_cleanup_old_schema.js`).
2. The script should iterate through `users`, fetch the `saved_links` subcollection, and delete those documents.
3. Once the data is deleted, you can update `firestore.rules` one last time to remove the `match /{document=**}` block inside `users/{userId}` to fully lock down those paths.
