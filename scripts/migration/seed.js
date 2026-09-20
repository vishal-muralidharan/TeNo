const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

admin.initializeApp({
  projectId: 'demo-teno'
});

const db = admin.firestore();
const auth = admin.auth();

async function seed() {
  console.log("Seeding emulator data...");
  
  // 1. Create a dummy user
  const user = await auth.createUser({
    uid: 'testuser123',
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User'
  });
  console.log(`Created user: ${user.uid}`);

  const batch = db.batch();

  // 2. User Preferences
  const prefRef = db.collection('users').doc(user.uid);
  batch.set(prefRef, {
    preferences: { theme: 'dark', styleMode: 'modern' }
  });

  // 3. User Settings UI
  const uiSettingsRef = db.collection('users').doc(user.uid).collection('settings').doc('ui');
  batch.set(uiSettingsRef, {
    favoritesRowCount: 2
  });

  // 4. Saved Links Label Order
  const labelsSettingsRef = db.collection('users').doc(user.uid).collection('settings').doc('labels_saved_links');
  batch.set(labelsSettingsRef, {
    order: ['work', 'reading']
  });

  // 5. Saved Links
  const linkRef1 = db.collection('users').doc(user.uid).collection('saved_links').doc('link_id_1');
  batch.set(linkRef1, {
    url: 'https://example.com',
    domain: 'example.com',
    nickname: 'Example',
    description: 'A useful site',
    label: 'work',
    isFavorite: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    favoritedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  const linkRef2 = db.collection('users').doc(user.uid).collection('saved_links').doc('link_id_2');
  batch.set(linkRef2, {
    url: 'https://news.ycombinator.com',
    domain: 'news.ycombinator.com',
    nickname: 'Hacker News',
    description: '',
    label: 'reading',
    isFavorite: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // 6. Cart Items
  const cartRef1 = db.collection('users').doc(user.uid).collection('cart_items').doc('cart_id_1');
  batch.set(cartRef1, {
    title: 'Monitor',
    url: 'https://store.com/monitor',
    label: 'tech',
    createdAt: new Date().toISOString()
  });

  // 7. Reminders
  const remRef1 = db.collection('users').doc(user.uid).collection('reminders').doc('rem_id_1');
  batch.set(remRef1, {
    text: 'Buy groceries',
    label: 'personal',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // 8. Shared Labels
  const sharedLabelRef = db.collection('shared_labels').doc('shared_label_1');
  batch.set(sharedLabelRef, {
    name: 'Team Resources',
    visibility: 'private',
    inviteToken: 'abc123token',
    members: {
      [user.uid]: { role: 'owner', name: 'Test User', email: 'test@example.com' }
    }
  });

  // 9. Shared Links
  const sharedLinkRef = db.collection('shared_links').doc('shared_link_1');
  batch.set(sharedLinkRef, {
    url: 'https://docs.example.com',
    domain: 'docs.example.com',
    nickname: 'Docs',
    description: 'Project documentation',
    labelId: 'shared_label_1',
    createdBy: user.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // 10. System Feature Flags
  const flagsRef = db.collection('system_config').doc('feature_flags');
  batch.set(flagsRef, {
    links: true,
    cart: true,
    reminders: true,
    timer: true
  });

  await batch.commit();
  console.log("Seed completed successfully!");
}

seed().catch(err => {
  console.error("Error during seed:", err);
  process.exit(1);
});
