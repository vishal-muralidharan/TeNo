import { collection, doc, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, setDoc, getDoc, getDocs, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

export class TeNoDatabase {
  constructor(uid, isNewSchema) {
    this.uid = uid;
    this.isNewSchema = isNewSchema;
    this.defaultLabelId = `default_${uid}`;
  }

  // --- Links ---
  subscribeLinks(callback) {
    if (this.isNewSchema) {
      const q = query(
        collection(db, 'links'),
        where('memberUids', 'array-contains', this.uid)
      );
      return onSnapshot(q, callback);
    } else {
      const q = query(collection(db, 'users', this.uid, 'saved_links'));
      return onSnapshot(q, callback);
    }
  }

  async addLink(linkData) {
    if (this.isNewSchema) {
      const labelId = linkData.labelId || this.defaultLabelId;
      const memberUids = linkData.memberUids || [this.uid];
      
      const { labelId: _, memberUids: __, ...rest } = linkData;
      
      return addDoc(collection(db, 'links'), {
        ...rest,
        ownerId: this.uid,
        labelId: labelId,
        memberUids: memberUids,
        createdAt: serverTimestamp()
      });
    } else {
      const { labelId, memberUids, ownerId, ...rest } = linkData;
      return addDoc(collection(db, 'users', this.uid, 'saved_links'), {
        ...rest,
        createdAt: serverTimestamp()
      });
    }
  }

  async updateLink(linkId, data) {
    if (this.isNewSchema) {
      return updateDoc(doc(db, 'links', linkId), data);
    } else {
      return updateDoc(doc(db, 'users', this.uid, 'saved_links', linkId), data);
    }
  }

  async deleteLink(linkId) {
    if (this.isNewSchema) {
      return deleteDoc(doc(db, 'links', linkId));
    } else {
      return deleteDoc(doc(db, 'users', this.uid, 'saved_links', linkId));
    }
  }

  // --- Cart ---
  subscribeCart(callback) {
    const q = query(collection(db, 'users', this.uid, 'cart_items'));
    return onSnapshot(q, callback);
  }

  async addCartItem(data) {
    return addDoc(collection(db, 'users', this.uid, 'cart_items'), {
      ...data,
      createdAt: serverTimestamp()
    });
  }

  async updateCartItem(id, data) {
    return updateDoc(doc(db, 'users', this.uid, 'cart_items', id), data);
  }

  async deleteCartItem(id) {
    return deleteDoc(doc(db, 'users', this.uid, 'cart_items', id));
  }

  // --- Reminders ---
  subscribeReminders(callback) {
    const q = query(collection(db, 'users', this.uid, 'reminders'));
    return onSnapshot(q, callback);
  }

  async addReminder(data) {
    return addDoc(collection(db, 'users', this.uid, 'reminders'), {
      ...data,
      createdAt: serverTimestamp()
    });
  }

  async deleteReminder(id) {
    return deleteDoc(doc(db, 'users', this.uid, 'reminders', id));
  }

  async updateReminder(id, data) {
    return updateDoc(doc(db, 'users', this.uid, 'reminders', id), data);
  }
  
  async deleteAllReminders(ids) {
    const batch = writeBatch(db);
    ids.forEach(id => {
      batch.delete(doc(db, 'users', this.uid, 'reminders', id));
    });
    return batch.commit();
  }

  // --- Settings ---
  subscribeUiSettings(callback) {
    return onSnapshot(doc(db, 'users', this.uid, 'settings', 'ui'), callback);
  }

  async updateUiSettings(data) {
    return setDoc(doc(db, 'users', this.uid, 'settings', 'ui'), data, { merge: true });
  }
  
  subscribeLabelOrder(collectionName, callback) {
     return onSnapshot(doc(db, 'users', this.uid, 'settings', `labels_${collectionName}`), callback);
  }
  
  async updateLabelOrder(collectionName, order) {
     return setDoc(doc(db, 'users', this.uid, 'settings', `labels_${collectionName}`), { order }, { merge: true });
  }

  // --- Shared Labels ---
  subscribeSharedLabels(callback) {
    if (this.isNewSchema) {
      // In new schema, shared labels are just labels where you are a member
      const q = query(collection(db, 'labels'), where('memberUids', 'array-contains', this.uid));
      return onSnapshot(q, callback);
    } else {
      const q = query(collection(db, 'shared_labels'), where(`members.${this.uid}`, '!=', null));
      return onSnapshot(q, callback);
    }
  }

  async addSharedLabel(data) {
    const col = this.isNewSchema ? 'labels' : 'shared_labels';
    // memberUids is required for new schema labels
    const docData = { ...data, createdAt: serverTimestamp() };
    if (this.isNewSchema) {
      docData.memberUids = Object.keys(data.members || {});
    }
    return addDoc(collection(db, col), docData);
  }

  async updateSharedLabel(id, data) {
    const col = this.isNewSchema ? 'labels' : 'shared_labels';
    return updateDoc(doc(db, col, id), data);
  }

  async batchDeleteSharedLabelAndLinks(labelId, links) {
    const batch = writeBatch(db);
    const labelCol = this.isNewSchema ? 'labels' : 'shared_labels';
    const linkCol = this.isNewSchema ? 'links' : 'shared_links';
    
    links.forEach(link => {
      batch.delete(doc(db, linkCol, link.id));
    });
    batch.delete(doc(db, labelCol, labelId));
    return batch.commit();
  }

  subscribeSharedLinks(labelId, callback) {
    if (this.isNewSchema) {
      const q = query(collection(db, 'links'), where('labelId', '==', labelId), where('memberUids', 'array-contains', this.uid));
      return onSnapshot(q, callback);
    } else {
      const q = query(collection(db, 'shared_links'), where('labelId', '==', labelId), where('memberUids', 'array-contains', this.uid));
      return onSnapshot(q, callback);
    }
  }

  async addSharedLink(data) {
    const col = this.isNewSchema ? 'links' : 'shared_links';
    const docData = { ...data, createdAt: serverTimestamp() };
    if (this.isNewSchema) {
      // Shared links need memberUids of the label. The frontend passes this.
      // If not passed, we fallback to just the creator, but in practice frontend passes it or we do a lookup.
      // For safety, assume frontend passes memberUids.
    }
    return addDoc(collection(db, col), docData);
  }

  async updateSharedLink(id, data) {
    const col = this.isNewSchema ? 'links' : 'shared_links';
    return updateDoc(doc(db, col, id), data);
  }

  async deleteSharedLink(id) {
    const col = this.isNewSchema ? 'links' : 'shared_links';
    return deleteDoc(doc(db, col, id));
  }


  // ─── Unified Label Management ──────────────────────────────────────────────

  /**
   * Subscribe to all labels of a given type that this user is a member of.
   * Used by LinkStorer / Reminders to render share badges on section headers.
   *
   * @param {string} type - 'links' | 'cart' | 'reminders'
   * @param {function} callback - onSnapshot callback
   */
  subscribeLabelsForSection(type, callback) {
    const q = query(
      collection(db, 'labels'),
      where('type', '==', type),
      where('memberUids', 'array-contains', this.uid)
    );
    return onSnapshot(q, callback);
  }

  /**
   * Find the labels doc whose name matches `name` + type, or create it if absent.
   * Returns the labels doc id.
   * This is called when the user first clicks "Share" on a private label.
   *
   * @param {string} name  - label name (e.g. "a4p")
   * @param {string} type  - 'links' | 'cart' | 'reminders'
   * @param {object} userInfo - { displayName, email }
   * @returns {Promise<string>} - the label doc id
   */
  async createOrGetLabel(name, type, userInfo = {}) {
    // Query for existing doc owned by this user with same name + type
    const q = query(
      collection(db, 'labels'),
      where('ownerId', '==', this.uid),
      where('name', '==', name),
      where('type', '==', type)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].id;
    }

    // Create new label doc
    const docRef = await addDoc(collection(db, 'labels'), {
      name,
      type,
      ownerId: this.uid,
      isShared: false,
      inviteToken: null,
      visibility: 'private',
      memberUids: [this.uid],
      members: {
        [this.uid]: {
          role: 'owner',
          name: userInfo.displayName || 'Unknown User',
          email: userInfo.email || '',
          joinedAt: serverTimestamp(),
        },
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  /**
   * Generic update for a labels doc.
   * Used by ShareModal for isShared, inviteToken, members.*.role, etc.
   *
   * @param {string} labelId
   * @param {object} data  - Firestore update payload (supports dot-path keys)
   */
  async updateLabel(labelId, data) {
    return updateDoc(doc(db, 'labels', labelId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  // --- Generic Helpers for LinkStorer ---

  subscribeEntries(collectionName, callback) {
    if (collectionName === 'saved_links' || collectionName === 'links') return this.subscribeLinks(callback);
    if (collectionName === 'cart_items') return this.subscribeCart(callback);
  }

  async addEntry(collectionName, data) {
    if (collectionName === 'saved_links' || collectionName === 'links') return this.addLink(data);
    if (collectionName === 'cart_items') return this.addCartItem(data);
  }

  async updateEntry(collectionName, id, data) {
    if (collectionName === 'saved_links' || collectionName === 'links') return this.updateLink(id, data);
    if (collectionName === 'cart_items') return this.updateCartItem(id, data);
  }

  async deleteEntry(collectionName, id) {
    if (collectionName === 'saved_links' || collectionName === 'links') return this.deleteLink(id);
    if (collectionName === 'cart_items') return this.deleteCartItem(id);
  }
}

export function getDb(uid, isNewSchema) {
  if (!uid) return null;
  return new TeNoDatabase(uid, isNewSchema);
}
