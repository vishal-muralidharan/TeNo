const admin = require('firebase-admin');

// We use the service account file you already have in scripts/migration/
try {
  const serviceAccount = require('../../scripts/migration/service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Successfully initialized Firebase Admin using local service-account.json');
} catch (error) {
  console.error('Failed to initialize Firebase Admin. Ensure service-account.json is present in scripts/migration/');
  console.error(error);
  process.exit(1);
}

const db = admin.firestore();

async function migrateData() {
  console.log('Starting migration to unified labels/links schema...');
  
  try {
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} users to process.`);
    
    let totalLinksMigrated = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const uid = userDoc.id;
      console.log(`\nProcessing user: ${uid}`);
      
      const savedLinksRef = userDoc.ref.collection('saved_links');
      const savedLinksSnapshot = await savedLinksRef.get();
      
      if (savedLinksSnapshot.empty) {
        console.log(`  No saved_links found for user ${uid}, skipping.`);
        continue;
      }
      
      console.log(`  Found ${savedLinksSnapshot.size} links to migrate.`);
      
      // Create the default "Saved Links" label in the root labels collection
      const newLabelRef = db.collection('labels').doc(); // Auto-generated ID
      
      const labelData = {
        name: 'Saved Links',
        ownerId: uid,
        memberUids: [uid],
        isShared: false,
        members: {
          [uid]: { role: 'owner', joinedAt: admin.firestore.FieldValue.serverTimestamp() }
        },
        visibility: 'private',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isDefaultMigrationLabel: true // helpful flag for debugging
      };
      
      // Use a batch to ensure atomicity
      const batch = db.batch();
      batch.set(newLabelRef, labelData);
      
      let linksInBatch = 1; // Start at 1 because we added the label doc
      
      for (const linkDoc of savedLinksSnapshot.docs) {
        const linkData = linkDoc.data();
        
        // Generate a new ID in the root links collection
        // We could reuse linkDoc.id, but letting Firestore generate is safer to avoid collisions
        const newLinkRef = db.collection('links').doc();
        
        const newLinkData = {
          ...linkData,
          labelId: newLabelRef.id,
          ownerId: uid,
          memberUids: [uid],
          migratedFrom: linkDoc.ref.path // Helpful for tracing back
        };
        
        batch.set(newLinkRef, newLinkData);
        linksInBatch++;
        totalLinksMigrated++;
        
        // Firestore batches can hold up to 500 writes
        if (linksInBatch >= 499) {
          console.log(`  Committing batch of ${linksInBatch} documents...`);
          await batch.commit();
          linksInBatch = 0;
        }
      }
      
      if (linksInBatch > 0) {
        console.log(`  Committing final batch of ${linksInBatch} documents for user ${uid}...`);
        await batch.commit();
      }
      
      console.log(`  Successfully migrated user ${uid}.`);
    }
    
    console.log(`\nMigration completed! Total links migrated: ${totalLinksMigrated}`);
    console.log('NOTE: Old data in users/{uid}/saved_links was NOT deleted and is safe.');
    
  } catch (error) {
    console.error('Migration failed due to an error:');
    console.error(error);
  }
}

migrateData().then(() => process.exit(0));
