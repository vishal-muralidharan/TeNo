import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../firebase';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { Users, X, Shield, ShieldAlert, User as UserIcon } from 'lucide-react';

export default function MembersModal({ label, currentUser, onClose }) {
  const [loadingId, setLoadingId] = useState(null);

  const currentUserRole = typeof label.members[currentUser.uid] === 'string'
    ? label.members[currentUser.uid]
    : label.members[currentUser.uid]?.role;
    
  const isOwner = currentUserRole === 'owner';

  const handleRoleChange = async (uid, newRole) => {
    if (!isOwner) return;
    setLoadingId(uid);
    try {
      await updateDoc(doc(db, 'shared_labels', label.id), {
        [`members.${uid}.role`]: newRole
      });
    } catch (err) {
      console.error('Failed to change role:', err);
      alert('Failed to change role.');
    }
    setLoadingId(null);
  };

  const [pendingRemove, setPendingRemove] = useState(null);

  const requestRemoveMember = (uid) => {
    if (!isOwner && uid !== currentUser.uid) return;
    setPendingRemove(uid);
  };

  const confirmRemoveMember = async () => {
    if (!pendingRemove) return;
    setLoadingId(pendingRemove);
    try {
      const docRef = doc(db, 'shared_labels', label.id);
      await updateDoc(docRef, {
        [`members.${pendingRemove}`]: deleteField()
      });
      if (pendingRemove === currentUser.uid) {
        onClose();
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert('Failed to remove member.');
    }
    setLoadingId(null);
    setPendingRemove(null);
  };

  return createPortal(
    <div className="custom-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="custom-modal" style={{ minWidth: '500px', maxWidth: '600px', position: 'relative' }}>
        
        {pendingRemove && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-app)', borderRadius: 'var(--border-radius)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, padding: '24px' }}>
            <p style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Are you sure you want to {pendingRemove === currentUser.uid ? 'leave' : 'remove this member from'} the label?</p>
            <div className="modal-actions">
              <button onClick={() => setPendingRemove(null)}>Cancel</button>
              <button className="danger" onClick={confirmRemoveMember}>{pendingRemove === currentUser.uid ? 'Leave' : 'Remove'}</button>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Users size={18} /> Members
          </h3>
          <button className="icon-btn" onClick={onClose} style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
          {Object.entries(label.members).map(([uid, data]) => {
            const role = typeof data === 'string' ? data : data.role;
            let rawName = typeof data === 'string' ? null : data.name;
            let email = typeof data === 'string' ? '' : data.email;
            
            if (uid === currentUser.uid) {
              rawName = currentUser.displayName || rawName;
              email = currentUser.email || email;
            } else if (liveProfiles[uid]) {
              rawName = liveProfiles[uid].name || rawName;
              email = liveProfiles[uid].email || email;
            }

            const name = (rawName && rawName.toLowerCase() !== 'unknown user') ? rawName : (email ? email.split('@')[0] : `User-${uid.substring(0, 4)}`);
            const isSelf = uid === currentUser.uid;

            return (
              <div key={uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--border-radius)', border: '1px var(--border-style) var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {role === 'owner' ? <ShieldAlert size={18} color="var(--color-accent)" /> : role === 'editor' ? <Shield size={18} /> : <UserIcon size={18} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', fontSize: '1.05rem' }}>
                      {name} {isSelf && <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 'normal', marginLeft: '6px' }}>(You)</span>}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {isOwner && role !== 'owner' ? (
                    <select
                      value={role}
                      onChange={(e) => handleRoleChange(uid, e.target.value)}
                      disabled={loadingId === uid}
                      style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  ) : (
                    <span style={{ fontSize: '0.85rem', padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-elevated)', opacity: 0.8, textTransform: 'capitalize' }}>
                      {role}
                    </span>
                  )}
                  
                  {(isOwner && role !== 'owner') || isSelf ? (
                    <button
                      className="icon-btn"
                      onClick={() => requestRemoveMember(uid)}
                      disabled={loadingId === uid}
                      title={isSelf ? 'Leave label' : 'Remove member'}
                      style={{ padding: '6px' }}
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
