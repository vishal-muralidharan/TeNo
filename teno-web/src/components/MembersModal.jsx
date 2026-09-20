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
      const currentMemberData = label.members[uid];
      const updatePayload = typeof currentMemberData === 'string'
        ? newRole
        : { ...currentMemberData, role: newRole };
        
      await updateDoc(doc(db, 'shared_labels', label.id), {
        [`members.${uid}`]: updatePayload
      });
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Failed to update role.');
    }
    setLoadingId(null);
  };

  const handleRemoveMember = async (uid) => {
    if (!isOwner && uid !== currentUser.uid) return;
    const action = uid === currentUser.uid ? 'leave' : 'remove this member from';
    if (!window.confirm(`Are you sure you want to ${action} this label?`)) return;
    
    setLoadingId(uid);
    try {
      await updateDoc(doc(db, 'shared_labels', label.id), {
        [`members.${uid}`]: deleteField()
      });
      if (uid === currentUser.uid) {
        onClose(); // Close modal if we left the label
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert('Failed to remove member.');
    }
    setLoadingId(null);
  };

  return createPortal(
    <div className="custom-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="custom-modal" style={{ minWidth: '400px', maxWidth: '500px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Users size={18} /> Members
          </h3>
          <button className="icon-btn" onClick={onClose} style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
          {Object.entries(label.members).map(([uid, data]) => {
            const role = typeof data === 'string' ? data : data.role;
            let rawName = typeof data === 'string' ? null : data.name;
            let email = typeof data === 'string' ? '' : data.email;
            
            if (uid === currentUser.uid) {
              rawName = currentUser.displayName || rawName;
              email = currentUser.email || email;
            }

            const name = (rawName && rawName.toLowerCase() !== 'unknown user') ? rawName : (email ? email.split('@')[0] : `User-${uid.substring(0, 4)}`);
            const isSelf = uid === currentUser.uid;

            return (
              <div key={uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {role === 'owner' ? <ShieldAlert size={16} color="var(--color-accent)" /> : role === 'editor' ? <Shield size={16} /> : <UserIcon size={16} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {name} {isSelf && <span style={{ fontSize: '10px', background: 'var(--color-accent)', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>YOU</span>}
                    </span>
                    {email && <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{email}</span>}
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
                      onClick={() => handleRemoveMember(uid)}
                      disabled={loadingId === uid}
                      title={isSelf ? 'Leave label' : 'Remove member'}
                      style={{ padding: '6px', color: 'var(--color-danger)' }}
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
