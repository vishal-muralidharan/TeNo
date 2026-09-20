import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../firebase';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { Users, X, Shield, ShieldAlert, User as UserIcon, ChevronDown } from 'lucide-react';

export default function MembersModal({ label, currentUser, onClose, dbApi }) {
  const [loadingId, setLoadingId] = useState(null);
  const [activeRoleMenu, setActiveRoleMenu] = useState(null);

  const currentUserRole = typeof label.members[currentUser.uid] === 'string'
    ? label.members[currentUser.uid]
    : label.members[currentUser.uid]?.role;
    
  const isOwner = currentUserRole === 'owner';

  const [liveProfiles, setLiveProfiles] = useState({});
  const [isFetchingProfiles, setIsFetchingProfiles] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!label || !label.members) {
        setIsFetchingProfiles(false);
        return;
      }
      
      const memberUids = Object.keys(label.members).filter(uid => uid !== currentUser.uid);
      const pendingUids = Object.keys(label.pendingMembers || {});
      const uids = [...new Set([...memberUids, ...pendingUids])];
      
      if (uids.length === 0) {
        setIsFetchingProfiles(false);
        return;
      }
      try {
        const response = await fetch('/api/getUserProfiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uids })
        });
        if (response.ok) {
          const data = await response.json();
          setLiveProfiles(data.profiles);
        }
      } catch (err) {
        console.error('Failed to fetch user profiles:', err);
      } finally {
        setIsFetchingProfiles(false);
      }
    };
    fetchProfiles();
  }, [label, currentUser.uid]);

  const handleVisibilityChange = async (newVisibility) => {
    if (!isOwner || !dbApi) return;
    try {
      await dbApi.updateSharedLabel(label.id, {
        visibility: newVisibility
      });
    } catch (err) {
      console.error('Failed to update visibility:', err);
      alert('Failed to update visibility.');
    }
  };

  const handleApproveMember = async (uid, name, email) => {
    setLoadingId(uid);
    try {
      const safeName = name || 'Unknown User';
      const safeEmail = email || '';
      if (dbApi) {
        await dbApi.updateSharedLabel(label.id, {
          [`members.${uid}`]: { role: 'viewer', name: safeName, email: safeEmail },
          [`pendingMembers.${uid}`]: deleteField()
        });
      }
    } catch (err) {
      console.error('Failed to approve member:', err);
      alert('Failed to approve member.');
    }
    setLoadingId(null);
  };

  const handleRejectMember = async (uid) => {
    setLoadingId(uid);
    try {
      if (dbApi) {
        await dbApi.updateSharedLabel(label.id, {
          [`pendingMembers.${uid}`]: deleteField()
        });
      }
    } catch (err) {
      console.error('Failed to reject member:', err);
      alert('Failed to reject member.');
    }
    setLoadingId(null);
  };

  const handleRoleChange = async (uid, newRole) => {
    if (!isOwner || !dbApi) return;
    setLoadingId(uid);
    try {
      await dbApi.updateSharedLabel(label.id, {
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
    if (!pendingRemove || !dbApi) return;
    setLoadingId(pendingRemove);
    try {
      await dbApi.updateSharedLabel(label.id, {
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px', paddingBottom: '120px' }}>
          
          {isOwner && label.pendingMembers && Object.keys(label.pendingMembers).length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Requests</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(label.pendingMembers).map(([uid, data]) => {
                  let rawName = data.name;
                  let email = data.email;
                  
                  if (liveProfiles[uid]) {
                    rawName = liveProfiles[uid].name || rawName;
                    email = liveProfiles[uid].email || email;
                  }

                  const name = (rawName && rawName.toLowerCase() !== 'unknown user') ? rawName : (email ? email.split('@')[0] : (isFetchingProfiles ? 'Loading...' : `User-${uid.substring(0, 4)}`));

                  return (
                    <div key={uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--border-radius)', border: '1px var(--border-style) var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UserIcon size={18} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', fontSize: '1.05rem' }}>
                            {name}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          className="btn-primary" 
                          onClick={() => handleApproveMember(uid, data.name, data.email)}
                          disabled={loadingId === uid}
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          Approve
                        </button>
                        <button 
                          className="icon-btn" 
                          onClick={() => handleRejectMember(uid)}
                          disabled={loadingId === uid}
                          style={{ padding: '6px' }}
                          title="Reject"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', margin: '24px 0 8px 0' }} />
            </div>
          )}

          {isOwner && label.pendingMembers && Object.keys(label.pendingMembers).length > 0 && (
            <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '4px', marginTop: '0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Members</h4>
          )}

          {Object.entries(label.members)
            .sort((a, b) => {
              if (a[0] === currentUser.uid) return -1;
              if (b[0] === currentUser.uid) return 1;
              const roleA = typeof a[1] === 'string' ? a[1] : a[1].role;
              const roleB = typeof b[1] === 'string' ? b[1] : b[1].role;
              const roleOrder = { owner: 1, editor: 2, viewer: 3 };
              return (roleOrder[roleA] || 99) - (roleOrder[roleB] || 99);
            })
            .map(([uid, data]) => {
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

            const isSelf = uid === currentUser.uid;
            const name = (rawName && rawName.toLowerCase() !== 'unknown user') 
              ? rawName 
              : (email ? email.split('@')[0] : (isFetchingProfiles && !isSelf ? 'Loading...' : `User-${uid.substring(0, 4)}`));

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
                    <div className="menu-wrapper" style={{ position: 'relative' }}>
                      <button 
                        className="icon-btn" 
                        onClick={(e) => { e.stopPropagation(); setActiveRoleMenu(activeRoleMenu === uid ? null : uid); }}
                        disabled={loadingId === uid}
                        style={{ fontSize: '0.85rem', padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px var(--border-style) var(--border-color)', textTransform: 'lowercase', display: 'flex', alignItems: 'center', gap: '4px', minWidth: '85px', justifyContent: 'space-between' }}
                      >
                        {role} <ChevronDown size={14} />
                      </button>
                      {activeRoleMenu === uid && (
                        <div className="dropdown-menu dropdown-menu-down" style={{ minWidth: '100px', top: 'calc(100% + 4px)', right: 0, textTransform: 'lowercase' }} onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { handleRoleChange(uid, 'editor'); setActiveRoleMenu(null); }} style={{ padding: '8px 12px' }}>editor</button>
                          <button onClick={() => { handleRoleChange(uid, 'viewer'); setActiveRoleMenu(null); }} style={{ padding: '8px 12px' }}>viewer</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-elevated)', opacity: 0.8, textTransform: 'lowercase' }}>
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
