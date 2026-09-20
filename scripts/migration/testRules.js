const { assertFails, assertSucceeds, initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const fs = require('fs');

let testEnv;
const rules = fs.readFileSync('../../firestore.rules', 'utf8');

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-teno-rules",
    firestore: { rules }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    
    await db.collection('labels').doc('label1').set({
      ownerId: 'alice',
      memberUids: ['alice', 'bob', 'charlie'],
      members: {
        'alice': { role: 'owner' },
        'bob': { role: 'editor' },
        'charlie': { role: 'viewer' }
      }
    });
    
    await db.collection('links').doc('link1').set({
      ownerId: 'alice',
      labelId: 'label1',
      memberUids: ['alice', 'bob', 'charlie']
    });
    
    await db.collection('users').doc('alice').collection('cart_items').doc('cart1').set({
      title: 'Item1'
    });
  });
});

after(async () => {
  await testEnv.cleanup();
});

describe("System Config", () => {
  it("allows any signed-in user to read flags", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(db.collection('system_config').doc('flags').get());
  });
  
  it("denies write to flags for non-admin", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(db.collection('system_config').doc('flags').set({ test: true }));
  });
  
  it("allows write to flags for admin", async () => {
    const db = testEnv.authenticatedContext('admin_user', { admin: true }).firestore();
    await assertSucceeds(db.collection('system_config').doc('flags').set({ test: true }));
  });
});

describe("Users Collection", () => {
  it("allows owner to read/write their own data", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(db.collection('users').doc('alice').get());
    await assertSucceeds(db.collection('users').doc('alice').collection('cart_items').doc('new').set({ a: 1 }));
  });

  it("denies access to cross-user private data", async () => {
    const db = testEnv.authenticatedContext('bob').firestore();
    await assertFails(db.collection('users').doc('alice').get());
    await assertFails(db.collection('users').doc('alice').collection('cart_items').doc('cart1').get());
  });

  it("denies unauthenticated access", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection('users').doc('alice').get());
  });
});

describe("Labels Collection", () => {
  it("allows owner to read", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(db.collection('labels').doc('label1').get());
  });
  
  it("allows editor and viewer to read", async () => {
    const db1 = testEnv.authenticatedContext('bob').firestore();
    const db2 = testEnv.authenticatedContext('charlie').firestore();
    await assertSucceeds(db1.collection('labels').doc('label1').get());
    await assertSucceeds(db2.collection('labels').doc('label1').get());
  });
  
  it("denies outsider to read", async () => {
    const db = testEnv.authenticatedContext('dave').firestore();
    await assertFails(db.collection('labels').doc('label1').get());
  });
  
  it("allows owner to update", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(db.collection('labels').doc('label1').update({ name: 'updated', ownerId: 'alice' }));
  });
  
  it("denies editor to update", async () => {
    const db = testEnv.authenticatedContext('bob').firestore();
    await assertFails(db.collection('labels').doc('label1').update({ name: 'hacked' }));
  });
  
  it("denies owner update if changing ownerId", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(db.collection('labels').doc('label1').update({ ownerId: 'bob' }));
  });
});

describe("Links Collection", () => {
  it("allows owner/editor/viewer to read", async () => {
    const db = testEnv.authenticatedContext('charlie').firestore();
    await assertSucceeds(db.collection('links').doc('link1').get());
  });
  
  it("denies outsider to read", async () => {
    const db = testEnv.authenticatedContext('dave').firestore();
    await assertFails(db.collection('links').doc('link1').get());
  });
  
  it("allows owner to create a link with correct memberUids", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(db.collection('links').doc('newLink').set({
      ownerId: 'alice',
      labelId: 'label1',
      memberUids: ['alice', 'bob', 'charlie']
    }));
  });
  
  it("denies create with forged memberUids", async () => {
    const db = testEnv.authenticatedContext('bob').firestore();
    await assertFails(db.collection('links').doc('newLink').set({
      ownerId: 'bob',
      labelId: 'label1',
      memberUids: ['bob'] // Mismatch with label1's memberUids
    }));
  });

  it("denies viewer to create", async () => {
    const db = testEnv.authenticatedContext('charlie').firestore();
    await assertFails(db.collection('links').doc('newLink2').set({
      ownerId: 'charlie',
      labelId: 'label1',
      memberUids: ['alice', 'bob', 'charlie']
    }));
  });
  
  it("denies editor to delete", async () => {
    const db = testEnv.authenticatedContext('bob').firestore();
    await assertFails(db.collection('links').doc('link1').delete());
  });
  
  it("allows label owner to delete", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(db.collection('links').doc('link1').delete());
  });
});
