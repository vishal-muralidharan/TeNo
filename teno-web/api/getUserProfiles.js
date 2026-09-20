import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Load .env.local in development
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

  const { uids } = req.body;

  if (!Array.isArray(uids) || uids.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid uids array' });
  }

  try {
    const auth = getAuth();
    
    // Fetch user records in chunks of 100 (Firebase Admin SDK limit)
    const users = [];
    for (let i = 0; i < uids.length; i += 100) {
      const chunk = uids.slice(i, i + 100);
      const identifiers = chunk.map(uid => ({ uid }));
      const result = await auth.getUsers(identifiers);
      users.push(...result.users);
    }

    // Map profiles
    const profiles = {};
    users.forEach(user => {
      profiles[user.uid] = {
        name: user.displayName || '',
        email: user.email || ''
      };
    });

    return res.status(200).json({ profiles });
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
