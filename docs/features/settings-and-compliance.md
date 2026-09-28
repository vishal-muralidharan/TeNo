# Settings & Compliance

TeNo respects user privacy and complies with modern data protection regulations (such as GDPR and DPDP) through robust data export and account deletion workflows.

## DPDP/GDPR Compliance: Data Export
Users have the right to access the data they have stored in TeNo.
- **Workflow**: From the Settings page, a user can click "Export My Data".
- **Technical Implementation**: 
  - The client fetches all documents owned by the user's `uid` across all core collections (`links`, `cart_items`, `reminders`, `labels`).
  - The data is assembled into a single JSON object.
  - A client-side Blob is generated, and a dynamic `<a>` tag is triggered to download the file directly to the user's local machine as `teno-export.json`.
  - *UI Component*: Implemented within `<SettingsPage />`.

## Server-Side Account Deletion
To ensure data is fully scrubbed from the system upon request, account deletion is handled via a secure backend process.
- **Workflow**: If a user chooses to delete their account, a confirmation modal ensures this destructive action is intentional.
- **Technical Implementation**:
  1. The client calls a dedicated Vercel Serverless Function (e.g. `api/deleteAccount.js`).
  2. The function uses the Firebase Admin SDK to bypass standard client-side rules and delete the user's identity from Firebase Auth.
  3. The function then recursively queries and deletes all Firestore documents (Links, Cart, Reminders, Labels) where `memberUids` contains (or `ownerId` matches) the user's UID.
  4. Once complete, the client signs out the local session.
- *Security Note*: The serverless function requires a valid `idToken` to prove authorization before proceeding with the destructive Admin SDK operations.
