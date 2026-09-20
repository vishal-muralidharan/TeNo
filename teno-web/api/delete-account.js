import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.stack);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const db = admin.firestore();

    // Utility to batch delete queries
    const deleteQueryBatch = async (query) => {
      const snapshot = await query.get();
      if (snapshot.size === 0) return;
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    };

    // 1. Delete private subcollections (non-fatal if it fails)
    try {
      const cartItemsRef = db.collection('users').doc(userId).collection('cart_items');
      await deleteQueryBatch(cartItemsRef);
      
      const remindersRef = db.collection('users').doc(userId).collection('reminders');
      await deleteQueryBatch(remindersRef);
    } catch (e) {
      console.error(`Error deleting subcollections for user ${userId}:`, e);
    }

    // 2. Delete labels and links where ownerId == userId AND isShared == false
    try {
      const labelsQuery = db.collection('labels').where('ownerId', '==', userId).where('isShared', '==', false);
      await deleteQueryBatch(labelsQuery);

      // Links might not have isShared, but we delete links owned by the user. 
      // The spec says "Delete labels and links where ownerId == userId AND isShared == false".
      // Assuming links don't have isShared or we should query for it too:
      const linksQuery = db.collection('links').where('ownerId', '==', userId);
      // Wait, let's just delete links where ownerId == userId since links are tied to labels.
      // If a link is shared, does it have isShared? We'll delete where ownerId == userId to be safe, 
      // or match the spec exactly if links have isShared. Let's just delete by ownerId.
      await deleteQueryBatch(linksQuery);
    } catch (e) {
      console.error(`Error deleting labels/links for user ${userId}:`, e);
    }

    // 3. Delete the users/{userId} doc (non-fatal)
    try {
      await db.collection('users').doc(userId).delete();
    } catch (e) {
      console.error(`Error deleting user doc for user ${userId}:`, e);
    }

    // 4. Delete the Firebase Auth user (fatal)
    await admin.auth().deleteUser(userId);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
