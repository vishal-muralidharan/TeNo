const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Load service-account from env if available
let credential;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const { cert } = require('firebase-admin/app');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = cert(serviceAccount);
    console.log('Using FIREBASE_SERVICE_ACCOUNT from env.');
  } catch (e) {
    console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e.message);
  }
}

if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log('Using Emulator for Verification...');
}

initializeApp(credential ? { credential } : { projectId: process.env.FIREBASE_PROJECT_ID || 'demo-no-project' });

const db = getFirestore();

async function verify() {
  console.log("Starting verification process...\n");
  let hasErrors = false;

  function reportError(msg) {
    console.error(`[ERROR] ${msg}`);
    hasErrors = true;
  }

  // 1. Verify Users & Default Labels
  const usersSnap = await db.collection('users').get();
  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const defaultLabelId = `default_${uid}`;
    
    const labelDoc = await db.collection('labels').doc(defaultLabelId).get();
    if (!labelDoc.exists) {
      reportError(`User ${uid} is missing default label ${defaultLabelId}`);
    } else {
      const labelData = labelDoc.data();
      if (labelData.ownerId !== uid) reportError(`Default label for ${uid} has wrong ownerId`);
      if (labelData.visibility !== 'private') reportError(`Default label for ${uid} should be private`);
    }

    // 2. Verify Links (Count and Field Checks)
    const oldLinksSnap = await userDoc.ref.collection('saved_links').get();
    const newLinksSnap = await db.collection('links')
      .where('ownerId', '==', uid)
      .where('labelId', '==', defaultLabelId)
      .get();
      
    if (oldLinksSnap.size !== newLinksSnap.size) {
      reportError(`User ${uid}: Link count mismatch. Old: ${oldLinksSnap.size}, New: ${newLinksSnap.size}`);
    }

    // Spot check each old link exists in the new schema with identical key fields
    for (const oldDoc of oldLinksSnap.docs) {
      const oldData = oldDoc.data();
      const newDoc = await db.collection('links').doc(oldDoc.id).get();
      
      if (!newDoc.exists) {
        reportError(`User ${uid}: Link ${oldDoc.id} not found in new links collection.`);
        continue;
      }
      
      const newData = newDoc.data();
      if (oldData.url !== newData.url) reportError(`Link ${oldDoc.id}: url mismatch`);
      if (oldData.nickname !== newData.nickname && (oldData.nickname || newData.nickname)) {
         reportError(`Link ${oldDoc.id}: nickname mismatch`);
      }
      if (oldData.description !== newData.description && (oldData.description || newData.description)) {
         reportError(`Link ${oldDoc.id}: description mismatch`);
      }
      // Cannot reliably strictly compare createdAt if it was generated on the fly for missing ones, but we check if it exists
      if (!newData.createdAt) reportError(`Link ${oldDoc.id}: missing createdAt`);
      
      if ((oldData.isFavorite || false) !== (newData.isFavorite || false)) {
        reportError(`Link ${oldDoc.id}: isFavorite mismatch`);
      }
      if (typeof newData.order !== 'number') {
        reportError(`Link ${oldDoc.id}: missing order field`);
      }
    }

    // 3. Verify Cart Items
    const oldCartSnap = await userDoc.ref.collection('cart_items').get();
    for (const oldDoc of oldCartSnap.docs) {
      const oldData = oldDoc.data();
      const newDoc = await userDoc.ref.collection('cart_items').doc(oldDoc.id).get();
      if (!newDoc.exists) reportError(`Cart Item ${oldDoc.id} not found in new schema`);
      
      const newData = newDoc.data();
      // Check title -> nickname mapping
      if (oldData.title !== newData.nickname && oldData.nickname !== newData.nickname) {
        reportError(`Cart Item ${oldDoc.id}: nickname mismatch (old title: ${oldData.title}, new nickname: ${newData.nickname})`);
      }
      if (typeof newData.order !== 'number') reportError(`Cart Item ${oldDoc.id}: missing order field`);
    }

    // 4. Verify Reminders
    const oldRemSnap = await userDoc.ref.collection('reminders').get();
    for (const oldDoc of oldRemSnap.docs) {
      const newDoc = await userDoc.ref.collection('reminders').doc(oldDoc.id).get();
      if (!newDoc.exists) reportError(`Reminder ${oldDoc.id} not found`);
      
      const newData = newDoc.data();
      if (typeof newData.order !== 'number') reportError(`Reminder ${oldDoc.id}: missing order field`);
      if (typeof newData.completed !== 'boolean') reportError(`Reminder ${oldDoc.id}: missing completed field`);
    }
  }

  // 5. Verify Shared Labels & Links relation (LabelId exists, memberUids match)
  const allLinksSnap = await db.collection('links').get();
  for (const linkDoc of allLinksSnap.docs) {
    const linkData = linkDoc.data();
    
    const labelDoc = await db.collection('labels').doc(linkData.labelId).get();
    if (!labelDoc.exists) {
      reportError(`Link ${linkDoc.id} has invalid labelId: ${linkData.labelId}`);
      continue;
    }
    
    const labelData = labelDoc.data();
    const linkMemberUids = linkData.memberUids || [];
    const labelMemberUids = labelData.memberUids || [];
    
    // Sort and compare arrays
    const sortedLinkUids = [...linkMemberUids].sort().join(',');
    const sortedLabelUids = [...labelMemberUids].sort().join(',');
    
    if (sortedLinkUids !== sortedLabelUids) {
      reportError(`Link ${linkDoc.id} memberUids do not match its parent label ${linkData.labelId}`);
    }
  }

  if (hasErrors) {
    console.error("\n❌ Verification FAILED with errors. See above.");
    process.exit(1);
  } else {
    console.log("\n✅ Verification PASSED! All data correctly migrated.");
    process.exit(0);
  }
}

verify().catch(err => {
  console.error("Verification script crashed:", err);
  process.exit(1);
});
