import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

config({ path: resolve(process.cwd(), '.env.local') });

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.stack);
  }
}

/**
 * POST /api/joinLabel
 *
 * Body: { inviteToken, idToken, name?, email? }
 *
 * 1. Verifies the idToken and extracts uid.
 * 2. Finds the label doc by inviteToken (searches root `labels` collection).
 * 3. Atomically:
 *    a. Adds uid to label.memberUids + label.members map.
 *    b. Adds uid to memberUids on ALL items associated with that labelId,
 *       across `links`, `cart_items`, and `reminders` root collections.
 * 4. Returns { success, status, labelId, labelName, type } so the frontend
 *    can redirect the user to the correct tab (links | cart | reminders).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { inviteToken, idToken, name: reqName, email: reqEmail } = req.body;

  if (!inviteToken || !idToken) {
    return res.status(400).json({ error: 'Missing inviteToken or idToken' });
  }

  try {
    // 1. Verify auth token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const name = decodedToken.name || reqName || 'Unknown User';
    const email = decodedToken.email || reqEmail || '';

    const db = getFirestore();

    // 2. Find label by inviteToken
    const labelsRef = db.collection('labels');
    const snapshot = await labelsRef
      .where('inviteToken', '==', inviteToken)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Invalid or expired invite link' });
    }

    const labelDoc = snapshot.docs[0];
    const labelId = labelDoc.id;
    const labelData = labelDoc.data();
    const labelType = labelData.type || 'links'; // fallback for legacy docs
    const labelName = labelData.name || '';

    // Already a member — return success immediately with redirect info
    if (labelData.memberUids && labelData.memberUids.includes(uid)) {
      return res.status(200).json({
        success: true,
        status: 'already_member',
        message: 'Already a member',
        labelId,
        labelName,
        type: labelType,
      });
    }

    // Check if sharing is still enabled
    if (labelData.isShared === false) {
      return res.status(403).json({ error: 'Sharing has been disabled for this label' });
    }

    // 3. Batch update: label + all associated items across all three item collections
    const batch = db.batch();

    // 3a. Add user to label doc
    batch.update(labelDoc.ref, {
      memberUids: FieldValue.arrayUnion(uid),
      [`members.${uid}`]: {
        role: 'editor', // new joiners default to editor
        name,
        email,
        joinedAt: FieldValue.serverTimestamp(),
      },
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 3b. Propagate uid to all existing items across all three collections
    const itemCollections = ['links', 'cart_items', 'reminders'];

    for (const colName of itemCollections) {
      const itemsSnap = await db
        .collection(colName)
        .where('labelId', '==', labelId)
        .get();

      itemsSnap.docs.forEach((itemDoc) => {
        batch.update(itemDoc.ref, {
          memberUids: FieldValue.arrayUnion(uid),
        });
      });
    }

    await batch.commit();

    return res.status(200).json({
      success: true,
      status: 'joined',
      message: 'Successfully joined label',
      labelId,
      labelName,
      type: labelType,
    });
  } catch (error) {
    console.error('Error joining label:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
