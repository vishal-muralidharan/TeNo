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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { inviteToken, idToken, name: reqName, email: reqEmail } = req.body;

  if (!inviteToken || !idToken) {
    return res.status(400).json({ error: 'Missing inviteToken or idToken' });
  }

  try {
    // 1. Verify the idToken to get the user's UID
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const name = decodedToken.name || reqName || 'Unknown User';
    const email = decodedToken.email || reqEmail || '';

    const db = getFirestore();
    
    // 2. Query Firestore for the label matching the inviteToken
    const labelsRef = db.collection('labels');
    const snapshot = await labelsRef.where('inviteToken', '==', inviteToken).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Invalid or expired invite link' });
    }

    const labelDoc = snapshot.docs[0];
    const labelId = labelDoc.id;
    const labelData = labelDoc.data();

    if (labelData.memberUids && labelData.memberUids.includes(uid)) {
      return res.status(200).json({ status: 'joined', message: 'Already a member', labelId });
    }

    // 3. Batch Update: Add user to Label and ALL associated Links
    const batch = db.batch();
    
    // Add to Label
    batch.update(labelDoc.ref, {
      memberUids: FieldValue.arrayUnion(uid),
      [`members.${uid}`]: {
        role: 'editor', // Defaulting new joins to editor
        name: name,
        email: email,
        joinedAt: FieldValue.serverTimestamp()
      }
    });

    // Find all links for this label and add user to memberUids
    const linksSnap = await db.collection('links').where('labelId', '==', labelId).get();
    
    linksSnap.docs.forEach((linkDoc) => {
      batch.update(linkDoc.ref, {
        memberUids: FieldValue.arrayUnion(uid)
      });
    });

    await batch.commit();

    return res.status(200).json({ status: 'joined', message: 'Successfully joined label', labelId });
  } catch (error) {
    console.error('Error joining label:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
