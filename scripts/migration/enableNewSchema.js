/**
 * One-shot script to enable the new_db_schema flag for all users in production.
 * Run AFTER verifying the migration is complete.
 * 
 * Usage: node enableNewSchema.js [--dry-run]
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let credential;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const { cert } = require('firebase-admin/app');
    credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
  } catch (e) {}
}

if (!credential) {
  try {
    const { cert } = require('firebase-admin/app');
    credential = cert(require('./service-account.json'));
    console.log('Using local service-account.json.');
  } catch (e) {}
}

initializeApp(credential ? { credential } : { projectId: 'demo-no-project' });
const db = getFirestore();

const isDryRun = process.argv.includes('--dry-run');

async function enableFlags() {
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'COMMIT'}`);

  const usersSnap = await db.collection('users').get();
  console.log(`Found ${usersSnap.size} users.`);

  let count = 0;
  for (const userDoc of usersSnap.docs) {
    const flagRef = userDoc.ref.collection('settings').doc('flags');
    if (!isDryRun) {
      await flagRef.set({ new_db_schema: true }, { merge: true });
    }
    count++;
    console.log(`  ${isDryRun ? '[dry]' : '✅'} Enabled new_db_schema for ${userDoc.id}`);
  }

  console.log(`\nDone. ${count} users processed.`);
}

enableFlags().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
