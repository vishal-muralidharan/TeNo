import { collection, doc, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
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

  // --- Shared Links ---
  subscribeSharedLinks(labelId, callback) {
    if (this.isNewSchema) {
      const q = query(collection(db, 'links'), where('labelId', '==', labelId), where('memberUids', 'array-contains', this.uid));
      return onSnapshot(q, callback);
    } else {
      const q = query(collection(db, 'shared_links'), where('labelId', '==', labelId), where(`members.${this.uid}`, '!=', null));
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
