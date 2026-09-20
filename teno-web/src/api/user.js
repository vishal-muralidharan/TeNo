import { doc, getDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export async function deleteUserAccount() {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in.');

  const idToken = await user.getIdToken(true); // force refresh

  const response = await fetch('/api/delete-account', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete account');
  }

  return await response.json();
}

export async function exportUserData() {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in.');
  const uid = user.uid;

  const exportData = {
    profile: null,
    cart_items: [],
    reminders: [],
    labels: [],
    links: []
  };

  try {
    // 1. Profile
    const profileSnap = await getDoc(doc(db, 'users', uid));
    if (profileSnap.exists()) {
      exportData.profile = profileSnap.data();
    }

    // 2. Private subcollections
    const cartSnap = await getDocs(collection(db, 'users', uid, 'cart_items'));
    cartSnap.forEach(doc => exportData.cart_items.push({ id: doc.id, ...doc.data() }));

    const remindersSnap = await getDocs(collection(db, 'users', uid, 'reminders'));
    remindersSnap.forEach(doc => exportData.reminders.push({ id: doc.id, ...doc.data() }));

    // 3. Shared/global collections where ownerId == uid
    const labelsQuery = query(collection(db, 'labels'), where('memberUids', 'array-contains', uid));
    const labelsSnap = await getDocs(labelsQuery);
    labelsSnap.forEach(doc => {
      if (doc.data().ownerId === uid) {
        exportData.labels.push({ id: doc.id, ...doc.data() });
      }
    });

    const linksQuery = query(collection(db, 'links'), where('memberUids', 'array-contains', uid));
    const linksSnap = await getDocs(linksQuery);
    linksSnap.forEach(doc => {
      if (doc.data().ownerId === uid) {
        exportData.links.push({ id: doc.id, ...doc.data() });
      }
    });

    return exportData;
  } catch (error) {
    console.error("Error exporting user data:", error);
    throw new Error("Failed to export user data.");
  }
}

export async function acceptTermsAndConditions() {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in.');

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    agreed_to_terms: true,
    updatedAt: new Date().toISOString()
  });
}
