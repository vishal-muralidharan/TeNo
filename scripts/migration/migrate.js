const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');

const isDryRun = !process.argv.includes('--commit');

// Use emulator if variables are set
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log("Using Emulator...");
}

initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID || 'demo-no-project'
});

const db = getFirestore();
const auth = getAuth();

const BATCH_SIZE = 400;

class BatchManager {
  constructor(db, isDryRun) {
    this.db = db;
    this.isDryRun = isDryRun;
    this.batch = db.batch();
    this.count = 0;
    this.stats = {
      users: 0,
      defaultLabels: 0,
      links: 0,
      sharedLinks: 0,
      cartItems: 0,
      reminders: 0,
      systemConfig: 0
    };
  }

  async set(ref, data, merge = true, type) {
    if (!this.isDryRun) {
      this.batch.set(ref, data, { merge });
    }
    this.stats[type]++;
    this.count++;
    
    if (this.count >= BATCH_SIZE) {
      await this.commit();
    }
  }

  async commit() {
    if (this.count > 0) {
      if (!this.isDryRun) {
        await this.batch.commit();
      }
      this.batch = this.db.batch();
      this.count = 0;
    }
  }
}

async function getAuthUsers() {
  const users = {};
  try {
    let pageToken;
    do {
      const result = await auth.listUsers(1000, pageToken);
      result.users.forEach(u => {
        users[u.uid] = {
          email: u.email,
          name: u.displayName
        };
      });
      pageToken = result.pageToken;
    } while (pageToken);
  } catch (e) {
    console.warn("Could not fetch Auth users. Ensure Auth Emulator is running if you want Auth metadata.", e.message);
  }
  return users;
}

function extractDomain(urlStr) {
  if (!urlStr) return '';
  let cleanUrl = urlStr.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  try {
    return new URL(cleanUrl).hostname;
  } catch (err) {
    return cleanUrl;
  }
}

async function migrate() {
  console.log(`Starting migration... Mode: ${isDryRun ? 'DRY RUN' : 'COMMIT'}`);
  
  const bm = new BatchManager(db, isDryRun);
  const authUsers = await getAuthUsers();
  
  // 1. System Config
  const flagsRef = db.collection('system_config').doc('flags');
  const flagsDoc = await flagsRef.get();
  if (!flagsDoc.exists) {
    await bm.set(flagsRef, {
      shared: true,
      links: true,
      cart: true,
      reminders: true,
      timer: true
    }, false, 'systemConfig');
  }

  // Iterate all users in Firestore
  const usersSnapshot = await db.collection('users').get();
  
  const allUids = new Set([
    ...usersSnapshot.docs.map(d => d.id),
    ...Object.keys(authUsers)
  ]);

  for (const uid of allUids) {
    const authUser = authUsers[uid] || {};
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    
    // a. Ensure users/{uid}
    const userData = userDoc.exists ? userDoc.data() : {};
    const preferences = userData.preferences || { theme: 'dark', styleMode: 'minimal' };
    
    // Check old UI settings
    const uiRef = userDocRef.collection('settings').doc('ui');
    const uiDoc = await uiRef.get();
    if (uiDoc.exists && uiDoc.data().favoritesRowCount) {
        preferences.favoritesRowCount = uiDoc.data().favoritesRowCount;
    }
    
    const userCreatedAt = userData.createdAt || FieldValue.serverTimestamp();
    
    await bm.set(userDocRef, {
      uid: uid,
      name: userData.name || authUser.name || 'User',
      email: userData.email || authUser.email || '',
      createdAt: userCreatedAt,
      preferences: preferences
    }, true, 'users');

    // b. Create default label
    const defaultLabelId = `default_${uid}`;
    const defaultLabelRef = db.collection('labels').doc(defaultLabelId);
    
    await bm.set(defaultLabelRef, {
      name: 'general',
      ownerId: uid,
      isShared: false,
      inviteToken: null,
      visibility: 'private',
      memberUids: [uid],
      members: {
        [uid]: { 
          role: 'owner', 
          name: userData.name || authUser.name || 'User',
          email: userData.email || authUser.email || '',
          joinedAt: userCreatedAt
        }
      },
      createdAt: userCreatedAt,
      updatedAt: FieldValue.serverTimestamp()
    }, true, 'defaultLabels');

    // c. Copy existing links
    const savedLinksSnap = await userDocRef.collection('saved_links').get();
    const linksData = savedLinksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort logic to generate `order`
    linksData.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        if (a.isFavorite && b.isFavorite) {
          const favA = a.favoritedAt?.toMillis?.() ?? (a.favoritedAt?.seconds ? a.favoritedAt.seconds * 1000 : 0);
          const favB = b.favoritedAt?.toMillis?.() ?? (b.favoritedAt?.seconds ? b.favoritedAt.seconds * 1000 : 0);
          return favA - favB;
        }
        const timeA = a.createdAt?.toMillis?.() ?? (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis?.() ?? (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeA - timeB;
    });

    for (let i = 0; i < linksData.length; i++) {
      const link = linksData[i];
      const linkRef = db.collection('links').doc(link.id);
      
      const newLink = {
        url: link.url,
        domain: link.domain || extractDomain(link.url),
        nickname: link.nickname || '',
        description: link.description || '',
        labelId: defaultLabelId,
        ownerId: uid,
        memberUids: [uid],
        isFavorite: link.isFavorite || false,
        order: i,
        createdAt: link.createdAt || FieldValue.serverTimestamp()
      };
      
      await bm.set(linkRef, newLink, true, 'links');
    }

    // d. Cart Items
    const cartSnap = await userDocRef.collection('cart_items').get();
    const cartData = cartSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    cartData.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
    });

    for (let i = 0; i < cartData.length; i++) {
        const item = cartData[i];
        const newRef = userDocRef.collection('cart_items').doc(item.id);
        
        await bm.set(newRef, {
            ...item,
            nickname: item.nickname || item.title || '',
            domain: item.domain || extractDomain(item.url),
            order: item.order !== undefined ? item.order : i
        }, true, 'cartItems');
    }

    // e. Reminders
    const remSnap = await userDocRef.collection('reminders').get();
    const remData = remSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    remData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() ?? (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis?.() ?? (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeA - timeB;
    });

    for (let i = 0; i < remData.length; i++) {
        const item = remData[i];
        const newRef = userDocRef.collection('reminders').doc(item.id);
        
        await bm.set(newRef, {
            ...item,
            order: item.order !== undefined ? item.order : i,
            completed: item.completed || false
        }, true, 'reminders');
    }
  }

  // Shared Labels -> Labels
  const sharedLabelsSnap = await db.collection('shared_labels').get();
  for (const docSnap of sharedLabelsSnap.docs) {
      const data = docSnap.data();
      const labelRef = db.collection('labels').doc(docSnap.id);
      
      let ownerId = null;
      let memberUids = [];
      const newMembers = {};

      if (data.members) {
          for (const [uid, roleData] of Object.entries(data.members)) {
              memberUids.push(uid);
              const authUser = authUsers[uid] || {};
              const role = typeof roleData === 'string' ? roleData : roleData.role;
              if (role === 'owner' && !ownerId) ownerId = uid;
              
              newMembers[uid] = {
                  role: role,
                  name: typeof roleData === 'object' ? roleData.name : (authUser.name || 'User'),
                  email: typeof roleData === 'object' ? roleData.email : (authUser.email || ''),
                  joinedAt: FieldValue.serverTimestamp()
              };
          }
      }

      await bm.set(labelRef, {
          name: data.name || '',
          ownerId: ownerId || 'unknown',
          isShared: true,
          inviteToken: data.inviteToken || null,
          visibility: data.visibility || 'private',
          memberUids: memberUids,
          members: newMembers,
          createdAt: data.createdAt || FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
      }, true, 'defaultLabels');
  }

  // Shared Links -> Links
  const sharedLinksSnap = await db.collection('shared_links').get();
  for (const docSnap of sharedLinksSnap.docs) {
      const data = docSnap.data();
      const linkRef = db.collection('links').doc(docSnap.id);
      
      let memberUids = [];
      if (data.labelId) {
          const labelSnap = await db.collection('shared_labels').doc(data.labelId).get();
          if (labelSnap.exists) {
             memberUids = Object.keys(labelSnap.data().members || {});
          }
      }

      await bm.set(linkRef, {
          url: data.url,
          domain: data.domain || extractDomain(data.url),
          nickname: data.nickname || '',
          description: data.description || '',
          labelId: data.labelId,
          ownerId: data.createdBy || 'unknown',
          memberUids: memberUids,
          isFavorite: false,
          order: 0,
          createdAt: data.createdAt || FieldValue.serverTimestamp()
      }, true, 'sharedLinks');
  }

  await bm.commit();

  console.log(`\nMigration completed! Mode: ${isDryRun ? 'DRY RUN' : 'COMMIT'}`);
  console.log("Summary:");
  console.log(bm.stats);

  fs.writeFileSync('report.json', JSON.stringify({
      mode: isDryRun ? 'DRY_RUN' : 'COMMIT',
      timestamp: new Date().toISOString(),
      stats: bm.stats
  }, null, 2));
  console.log("Report written to report.json");
}

migrate().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
