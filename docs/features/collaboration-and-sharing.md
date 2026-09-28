# Collaboration and Sharing

TeNo features a powerful sharing and collaboration engine built around a unified "labels" architecture. This allows users to seamlessly share collections of links, cart items, or reminders with others.

## Unified Root-Level Labels Architecture

Rather than managing sharing at the individual item level, TeNo uses a top-level `labels` collection in Firestore. 
- A label is a grouping tag (e.g., "Kitchen Renovation", "Dev Tools").
- Links, Cart Items, and Reminders each contain a `labelId` reference.
- When a user is granted access to a label, they automatically gain access to all items across the Links, Cart, and Reminders collections that share that `labelId`.

## How Native Sharing Works

1. **Invite Generation**: A label owner can generate an invite link from the UI. This triggers a Firestore update that assigns a unique, secure `inviteToken` to the label document.
2. **Accepting an Invite**: When a recipient clicks the invite link, they are taken to the TeNo app. If authenticated, the app sends their `idToken` and the `inviteToken` to the backend.

## Serverless Handling (`api/joinLabel.js`)

To ensure security, the process of joining a label is handled by a Vercel Serverless Function:
- The function verifies the user's Firebase Auth `idToken` using the Firebase Admin SDK.
- It queries the database for the label matching the `inviteToken`.
- Upon validation, it performs an atomic batch write:
  1. It adds the user's UID to the `memberUids` array on the main label document.
  2. It iterates through the `links`, `cart_items`, and `reminders` collections, appending the user's UID to the `memberUids` array of *every* item associated with that label.
- This denormalized approach allows Firestore security rules to remain highly efficient (checking `request.auth.uid in resource.data.memberUids`).

## Role-Based Access Control (RBAC)

The main label document stores a `members` map that tracks roles:
- **Owner**: The original creator. Can delete the label, revoke access, and manage the `inviteToken`.
- **Editor**: (Default for new joiners). Can add, edit, and delete items within the label.
- **Viewer**: Read-only access to the label's contents. 
*(Note: UI enforcement of Viewer/Editor roles is managed dynamically based on the current user's entry in the label's `members` map).*
