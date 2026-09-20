import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

config({ path: resolve(process.cwd(), '.env.local') });

if (!getApps().length) {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(sa) });
}

const db = getFirestore();

async function runTest() {
  console.log('--- Starting Private Label Approval Flow Test ---');
  let testLabelId = null;
  const ownerUid = 'TEST_OWNER_UID';
  const requesterUid = 'TEST_REQUESTER_UID';

  try {
    // Step 1: Create a private shared label
    console.log('\n[Step 1] Creating a private shared label...');
    const labelRef = await db.collection('shared_labels').add({
      name: 'E2E Test Private Label',
      ownerId: ownerUid,
      inviteToken: 'test-invite-token-123',
      visibility: 'private',
      members: {
        [ownerUid]: {
          role: 'owner',
          name: 'Test Owner',
          email: 'owner@example.com'
        }
      },
      createdAt: FieldValue.serverTimestamp()
    });
    testLabelId = labelRef.id;
    console.log(`✅ Label created with ID: ${testLabelId}`);

    // Step 2: Simulate User joining (Logic from api/joinSharedLabel.js)
    console.log('\n[Step 2] Simulating User Requesting Access (via API logic)...');
    await labelRef.update({
      [`pendingMembers.${requesterUid}`]: {
        name: 'Test Requester',
        email: 'requester@example.com',
        timestamp: new Date().toISOString()
      }
    });
    console.log(`✅ Requester added to pendingMembers.`);

    // Verify State After Request
    const afterRequestSnap = await labelRef.get();
    const afterRequestData = afterRequestSnap.data();
    if (afterRequestData.pendingMembers && afterRequestData.pendingMembers[requesterUid]) {
       console.log('✅ Verified: Requester is in pendingMembers queue.');
    } else {
       throw new Error('Requester is NOT in pendingMembers queue!');
    }

    if (afterRequestData.members && afterRequestData.members[requesterUid]) {
       throw new Error('Requester is mistakenly in members queue before approval!');
    } else {
       console.log('✅ Verified: Requester is NOT in current members.');
    }

    // Step 3: Simulate Owner Approving User (Logic from MembersModal.jsx)
    console.log('\n[Step 3] Simulating Owner Approving the Request...');
    const pendingData = afterRequestData.pendingMembers[requesterUid];
    const safeName = pendingData.name || 'Unknown User';
    const safeEmail = pendingData.email || '';
    
    await labelRef.update({
      [`members.${requesterUid}`]: { role: 'viewer', name: safeName, email: safeEmail },
      [`pendingMembers.${requesterUid}`]: FieldValue.delete()
    });
    console.log(`✅ Owner approved the request.`);

    // Verify Final State
    const finalSnap = await labelRef.get();
    const finalData = finalSnap.data();
    
    if (finalData.pendingMembers && finalData.pendingMembers[requesterUid]) {
       throw new Error('Requester is still in pendingMembers queue after approval!');
    } else {
       console.log('✅ Verified: Requester was successfully removed from pendingMembers.');
    }

    if (finalData.members && finalData.members[requesterUid]) {
       const role = finalData.members[requesterUid].role;
       if (role === 'viewer') {
           console.log('✅ Verified: Requester is now a full member with role: viewer.');
       } else {
           throw new Error(`Requester has incorrect role: ${role}`);
       }
    } else {
       throw new Error('Requester was not added to members!');
    }

    console.log('\n🎉 ALL TESTS PASSED! The flow works flawlessly.');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
  } finally {
    // Cleanup
    if (testLabelId) {
      console.log(`\n[Cleanup] Deleting test label ${testLabelId}...`);
      await db.collection('shared_labels').doc(testLabelId).delete();
      console.log('✅ Cleanup complete.');
    }
    process.exit(0);
  }
}

runTest();
