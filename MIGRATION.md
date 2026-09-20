# TeNo Firestore Migration Checklist

## PHASE 7: Rollout Order

**Before you begin**, coordinate a short maintenance window if necessary, although this migration is designed to be non-destructive and backwards-compatible with old client paths during the transition.

- [ ] **1. Full Backup / Export (Crucial First Step)**
  Take a complete snapshot of the production database before any scripts run.
  - Command:
    ```bash
    gcloud firestore export gs://<your-backup-bucket-name>/backup-$(date +%Y%m%d-%H%M%S)
    ```
  - *How to restore if needed*:
    ```bash
    gcloud firestore import gs://<your-backup-bucket-name>/backup-<date>
    ```

- [ ] **2. Deploy Indexes and New Rules**
  - Ensure the new `firestore.rules` (which includes both new and old paths for the transition) and `firestore.indexes.json` are deployed to Firebase.
  - Command:
    ```bash
    firebase deploy --only firestore
    ```

- [ ] **3. Run Migration**
  - Set your `GOOGLE_APPLICATION_CREDENTIALS` or use `firebase login` if using the Firebase CLI environment.
  - Run the dry-run first to verify counts:
    ```bash
    cd scripts/migration
    node migrate.js --dry-run
    ```
  - If everything looks correct, run the commit:
    ```bash
    node migrate.js --commit
    ```

- [ ] **4. Run Verification**
  - Ensure all data was copied accurately and fields match:
    ```bash
    cd scripts/migration
    node verify.js
    ```

- [ ] **5. Deploy Applications**
  - **teno-web**: Deploy the updated React web app.
  - **teno-extension**: Publish the new version to the Chrome Web Store.
  
- [ ] **6. Monitoring Period**
  - Wait for the extension update to propagate to users.
  - Periodically run `migrate.js --commit` and `verify.js` to catch and migrate any data written to the *old* paths by users still on older versions of the extension.

- [ ] **7. Cleanup (Explicit Confirmation Required)**
  - Once telemetry confirms no users are on the old extension version, run the `cleanup.js` script to delete the old collections.
  - Update `firestore.rules` to remove access to the old paths and deploy again.

## Rollback Plan

At any point during **Steps 2 - 6**, you can abort the migration without data loss because the migration script is non-destructive (it only copies data to new paths). 

- **If the migration script fails**: Fix the script and re-run. It is idempotent.
- **If the new apps are deployed and failing**: 
  - Web: Roll back the deployment in Vercel/Firebase Hosting.
  - Extension: If possible, upload the old bundle.
- **If data corruption occurs (rare, due to non-destructive nature)**: Restore from the Google Cloud Storage bucket backup taken in Step 1.
