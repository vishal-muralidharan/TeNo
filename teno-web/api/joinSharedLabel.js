import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Load .env.local in development (Vercel dev doesn't inject it for API functions)
config({ path: resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin if not already initialized
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

    // 2. Query Firestore for the label matching the inviteToken
    const db = getFirestore();
    const labelsRef = db.collection('shared_labels');
    const snapshot = await labelsRef.where('inviteToken', '==', inviteToken).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Invalid or expired invite link' });
    }

    const labelDoc = snapshot.docs[0];
    const labelId = labelDoc.id;
    const labelData = labelDoc.data();

    // 3. Check if user is already a member or pending
    if (labelData.members && labelData.members[uid]) {
      return res.status(200).json({ status: 'joined', message: 'Already a member', labelId });
    }
    if (labelData.pendingMembers && labelData.pendingMembers[uid]) {
      return res.status(200).json({ status: 'pending', message: 'Request pending approval', labelId });
    }

    const name = decodedToken.name || reqName || 'Unknown User';
    const email = decodedToken.email || reqEmail || '';

    // 4. Check label visibility
    const isPrivate = labelData.visibility === 'private';

    if (isPrivate) {
      await labelsRef.doc(labelId).update({
        [`pendingMembers.${uid}`]: {
          name: name,
          email: email,
          timestamp: new Date().toISOString()
        }
      });
      return res.status(200).json({ status: 'pending', message: 'Request sent to owner', labelId });
    } else {
      await labelsRef.doc(labelId).update({
        [`members.${uid}`]: {
          role: 'viewer',
          name: name,
          email: email
        }
      });
      return res.status(200).json({ status: 'joined', message: 'Successfully joined label', labelId });
    }

  } catch (error) {
    console.error('Error joining shared label:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
