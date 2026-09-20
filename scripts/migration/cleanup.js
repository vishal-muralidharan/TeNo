const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const readline = require('readline');

// Optional: you can load service account key if running in prod
// const serviceAccount = require('./service-account.json');

try {
  // Try to initialize with default credentials (if logged in via firebase CLI or running on GCP)
  // If serviceAccount is provided, use credential: cert(serviceAccount)
  initializeApp();
} catch (e) {
  console.error("Failed to initialize Firebase Admin. Ensure you are authenticated.");
  process.exit(1);
}

const db = getFirestore();

// Batch delete function to handle large collections
async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

async function deleteCollection(collectionPath, batchSize = 500) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const isProd = args.includes('--prod');
  const isConfirmed = args.includes('--confirm');

  if (isProd) {
    console.warn("⚠️  WARNING: Running cleanup in PRODUCTION mode!");
  } else {
    console.log("ℹ️  Running cleanup in EMULATOR/DEV mode.");
  }

  if (!isConfirmed) {
    console.error("Cleanup is destructive! You must pass --confirm to run this script.");
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("\nThis script will PERMANENTLY DELETE all legacy collections.");
  console.log("Legacy collections to delete:");
  console.log("- saved_links");
  console.log("- cart_items");
  console.log("- shared_labels\n");

  rl.question('Are you absolutely sure? Type "DELETE" to confirm: ', async (answer) => {
    rl.close();
    if (answer !== 'DELETE') {
      console.log("Aborted.");
      process.exit(0);
    }

    try {
      console.log("Deleting saved_links...");
      await deleteCollection('saved_links');
      console.log("✅ Deleted saved_links.");

      console.log("Deleting cart_items...");
      await deleteCollection('cart_items');
      console.log("✅ Deleted cart_items.");

      console.log("Deleting shared_labels...");
      await deleteCollection('shared_labels');
      console.log("✅ Deleted shared_labels.");

      // Also clean up users/{uid}/saved_links, cart_items, reminders (if these are considered legacy and were migrated up? Wait, users/{uid} is the new schema!)
      // Wait, in Phase 1, we decided users/{uid}/saved_links is the legacy schema inside the extension!
      // In the new schema:
      // - links (root)
      // - cart (root)
      // - reminders (root)
      // - labels (root)
      
      console.log("\nCleanup script finished successfully. Legacy root collections removed.");
      console.log("Note: To remove user subcollections (users/{uid}/*) you would need to iterate all users.");
    } catch (e) {
      console.error("Error during cleanup:", e);
    }
  });
}

main().catch(console.error);
