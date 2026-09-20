/**
 * ShareModal.jsx
 *
 * A unified Share / Collaboration modal that renders inside any label
 * in the links, cart, or reminders sections.
 *
 * Props:
 *   label        {object}  – The Firestore label doc (must have id, name, type, members, isShared, inviteToken)
 *   currentUser  {object}  – Firebase auth user
 *   onClose      {func}    – Dismiss callback
 *   dbApi        {object}  – TeNoDatabase instance
 */
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Copy, Check, Users, ShieldAlert, Shield, User as UserIcon,
  ChevronDown, Link2,
} from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { getUiConfig } from '../utils/uiConfig';

// ─── helpers ───────────────────────────────────────────────────────────────

function getRole(label, uid) {
  const raw = label.members?.[uid];
  if (!raw) return 'viewer';
  return typeof raw === 'string' ? raw : (raw.role || 'viewer');
}

// ─── MemberRow ──────────────────────────────────────────────────────────────

function MemberRow({ uid, data, isSelf, isOwner, onRoleChange, onRemove, ui, isModern }) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const role = typeof data === 'string' ? data : (data?.role || 'viewer');
  const rawName = typeof data === 'object' ? data?.name : null;
  const email = typeof data === 'object' ? data?.email : '';
  const name = (rawName && rawName !== 'Unknown User')
    ? rawName
    : (email ? email.split('@')[0] : `User-${uid.slice(0, 4)}`);

  const roleLabel = ui.share.roles[role] || role;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isModern ? '12px 16px' : '8px 0',
      background: isModern ? 'var(--bg-surface)' : 'transparent',
      borderRadius: isModern ? 'var(--border-radius)' : '0',
      border: isModern ? '1px var(--border-style) var(--border-color)' : 'none',
      borderBottom: !isModern ? '1px solid var(--border-color)' : undefined,
      gap: '12px',
    }}>
      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--bg-elevated, var(--bg-surface))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          border: '1px solid var(--border-color)',
        }}>
          {role === 'owner'
            ? <ShieldAlert size={15} color="var(--color-accent)" />
            : role === 'editor'
            ? <Shield size={15} />
            : <UserIcon size={15} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontWeight: '500', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
            {isSelf && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px', fontWeight: 'normal' }}>
                ({isModern ? 'You' : 'you'})
              </span>
            )}
          </span>
          {email && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email}
            </span>
          )}
        </div>
      </div>

      {/* Role + remove */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {isOwner && role !== 'owner' ? (
          <div style={{ position: 'relative' }}>
            <button
              className="icon-btn"
              onClick={(e) => { e.stopPropagation(); setRoleMenuOpen(v => !v); }}
              style={{
                fontSize: '0.82rem', padding: '3px 8px',
                border: '1px var(--border-style) var(--border-color)',
                background: 'var(--bg-elevated, var(--bg-surface))',
                display: 'flex', alignItems: 'center', gap: '4px',
                textTransform: 'var(--text-transform)',
                borderRadius: isModern ? '6px' : '0',
              }}
            >
              {roleLabel} {isModern && <ChevronDown size={12} />}
            </button>
            {roleMenuOpen && (
              <div
                className="dropdown-menu dropdown-menu-down"
                style={{ minWidth: '90px', right: 0, top: 'calc(100% + 4px)', left: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                {['editor', 'viewer'].map(r => (
                  <button key={r}
                    onClick={() => { onRoleChange(uid, r); setRoleMenuOpen(false); }}
                    style={{ padding: '8px 12px', textTransform: 'var(--text-transform)' }}
                  >
                    {ui.share.roles[r]}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span style={{
            fontSize: '0.82rem', padding: '3px 8px',
            border: '1px var(--border-style) var(--border-color)',
            opacity: 0.7, textTransform: 'var(--text-transform)',
            borderRadius: isModern ? '6px' : '0',
          }}>
            {roleLabel}
          </span>
        )}

        {((isOwner && role !== 'owner') || isSelf) && (
          <button
            className="icon-btn"
            title={isSelf ? ui.share.leave : ui.share.kick}
            onClick={() => onRemove(uid, isSelf)}
            style={{ padding: '4px', color: 'var(--color-danger)' }}
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── ShareModal ──────────────────────────────────────────────────────────────

export default function ShareModal({ label, currentUser, onClose, dbApi }) {
  const { styleMode } = useTheme();
  const ui = getUiConfig(styleMode);
  const isModern = styleMode === 'modern';

  const currentRole = getRole(label, currentUser.uid);
  const isOwner = currentRole === 'owner';

  const [isShared, setIsShared] = useState(label.isShared ?? false);
  const [inviteToken, setInviteToken] = useState(label.inviteToken || null);
  const [copied, setCopied] = useState(false);
  const [togglingShare, setTogglingShare] = useState(false);
  const [pendingRemove, setPendingRemove] = useState(null);
  const [loadingUid, setLoadingUid] = useState(null);
  const copiedTimerRef = useRef(null);

  useEffect(() => {
    setIsShared(label.isShared ?? false);
    setInviteToken(label.inviteToken || null);
  }, [label.isShared, label.inviteToken]);

  const inviteLink = inviteToken ? `${window.location.origin}/join/${inviteToken}` : null;

  const handleToggleSharing = async () => {
    if (!isOwner || !dbApi) return;
    setTogglingShare(true);
    try {
      if (!isShared) {
        let token = inviteToken;
        if (!token) {
          token = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
        }
        await dbApi.updateLabel(label.id, { isShared: true, inviteToken: token });
        setIsShared(true);
        setInviteToken(token);
      } else {
        await dbApi.updateLabel(label.id, { isShared: false });
        setIsShared(false);
      }
    } catch (err) {
      console.error('Failed to toggle sharing:', err);
    }
    setTogglingShare(false);
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleRoleChange = async (uid, newRole) => {
    if (!isOwner || !dbApi) return;
    setLoadingUid(uid);
    try {
      await dbApi.updateLabel(label.id, { [`members.${uid}.role`]: newRole });
    } catch (err) {
      console.error('Failed to change role:', err);
    }
    setLoadingUid(null);
  };

  const handleRemoveMember = (uid, isSelf) => {
    setPendingRemove({ uid, isSelf });
  };

  const confirmRemove = async () => {
    if (!pendingRemove || !dbApi) return;
    const { uid, isSelf } = pendingRemove;
    setLoadingUid(uid);
    try {
      const { deleteField } = await import('firebase/firestore');
      await dbApi.updateLabel(label.id, { [`members.${uid}`]: deleteField() });
      if (isSelf) onClose();
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
    setLoadingUid(null);
    setPendingRemove(null);
  };

  const sortedMembers = Object.entries(label.members || {}).sort(([aUid, aData], [bUid, bData]) => {
    if (aUid === currentUser.uid) return -1;
    if (bUid === currentUser.uid) return 1;
    const roleOrder = { owner: 1, editor: 2, viewer: 3 };
    const rA = typeof aData === 'string' ? aData : aData?.role;
    const rB = typeof bData === 'string' ? bData : bData?.role;
    return (roleOrder[rA] || 9) - (roleOrder[rB] || 9);
  });

  // ── Styles ──────────────────────────────────────────────────────────────────

  const modalStyle = {
    background: isModern ? 'rgba(14,14,18,0.95)' : 'var(--bg-app)',
    border: isModern
      ? '1px solid rgba(255,255,255,0.1)'
      : '2px solid var(--border-color)',
    borderRadius: isModern ? '20px' : '0',
    padding: isModern ? '28px 32px' : '20px',
    width: '100%',
    maxWidth: isModern ? '520px' : '480px',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: isModern ? '0 25px 50px rgba(0,0,0,0.6)' : 'none',
    display: 'flex', flexDirection: 'column', gap: isModern ? '22px' : '14px',
    position: 'relative',
  };

  const renderConfirmRemove = () => (
    <div style={{
      position: 'absolute', inset: 0,
      background: isModern ? 'rgba(14,14,18,0.97)' : 'var(--bg-app)',
      borderRadius: isModern ? '20px' : '0',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '20px', padding: '32px', zIndex: 10,
    }}>
      <p style={{ textAlign: 'center', fontSize: '1rem', textTransform: 'var(--text-transform)' }}>
        {pendingRemove?.isSelf
          ? `${isModern ? 'Leave' : 'leave'} "${label.name}"?`
          : `${isModern ? 'Remove this member?' : 'remove this member?'}`}
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="icon-btn" onClick={() => setPendingRemove(null)}>
          {ui.confirm.deleteItem.cancel}
        </button>
        <button className="danger icon-btn" onClick={confirmRemove}>
          {pendingRemove?.isSelf ? ui.share.leave : ui.share.kick}
        </button>
      </div>
    </div>
  );

  return createPortal(
    <div
      className="custom-modal-overlay"
      style={{
        position: 'fixed', inset: 0,
        background: isModern ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: isModern ? 'blur(8px)' : 'none',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="share-modal" style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {pendingRemove && renderConfirmRemove()}

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isModern && <Users size={16} strokeWidth={2} />}
            <h3 style={{
              margin: 0, fontSize: isModern ? '1.15rem' : '1rem', fontWeight: '600',
              textTransform: 'var(--text-transform)',
            }}>
              {ui.share.title} — {label.name}
            </h3>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        {/* ── Sharing Toggle (owner only) ────────────────────── */}
        {isOwner && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: isModern ? '14px 18px' : '6px 0',
            background: isModern ? 'var(--bg-surface)' : 'transparent',
            borderRadius: isModern ? 'var(--border-radius)' : '0',
            border: isModern ? '1px var(--border-style) var(--border-color)' : 'none',
            borderBottom: !isModern ? '1px solid var(--border-color)' : undefined,
          }}>
            <span style={{ fontSize: '0.95rem', textTransform: 'var(--text-transform)' }}>
              {ui.share.toggleLabel}
            </span>
            <button
              className="icon-btn"
              onClick={handleToggleSharing}
              disabled={togglingShare}
              style={{ padding: '2px' }}
              title={isShared ? 'Disable sharing' : 'Enable sharing'}
            >
              {/* Custom pill toggle */}
              <div style={{
                width: '44px', height: '24px', borderRadius: '12px',
                background: isShared ? 'var(--color-accent)' : 'var(--border-color)',
                position: 'relative', transition: 'background 0.2s ease',
                border: isModern ? 'none' : '1px solid var(--border-color)',
              }}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: isShared ? (isModern ? '#000' : 'var(--bg-app)') : 'var(--text-muted)',
                  position: 'absolute', top: '3px',
                  left: isShared ? '23px' : '3px',
                  transition: 'left 0.2s ease, background 0.2s ease',
                }} />
              </div>
            </button>
          </div>
        )}

        {/* ── Invite Link ────────────────────────────────────── */}
        {isShared && inviteLink && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'var(--text-transform)' }}>
              {ui.share.inviteLabel}
            </span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: isModern ? 'var(--bg-surface)' : 'var(--bg-app)',
              border: '1px var(--border-style) var(--border-color)',
              borderRadius: isModern ? '10px' : '0',
              padding: '10px 14px', overflow: 'hidden',
            }}>
              <Link2 size={14} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
              <span style={{
                flex: 1, fontSize: '0.82rem', color: 'var(--text-secondary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {inviteLink}
              </span>
              <button
                className="icon-btn"
                onClick={handleCopyLink}
                style={{
                  flexShrink: 0, fontSize: '0.8rem',
                  padding: isModern ? '5px 12px' : '2px 6px',
                  background: isModern
                    ? (copied ? 'var(--color-success)' : 'rgba(255,255,255,0.08)')
                    : 'transparent',
                  border: isModern ? 'none' : '1px solid var(--border-color)',
                  borderRadius: isModern ? '8px' : '0',
                  color: copied ? (isModern ? '#000' : 'var(--color-success)') : 'var(--text-primary)',
                  transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: '5px',
                  textTransform: 'var(--text-transform)',
                }}
              >
                {copied ? <><Check size={13} /> {ui.share.copied}</> : <><Copy size={13} /> {ui.share.copyLink}</>}
              </button>
            </div>
          </div>
        )}

        {/* ── Members ────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'var(--text-transform)' }}>
            {ui.share.members} ({sortedMembers.length})
          </span>
          {sortedMembers.length === 0 ? (
            <p className="section-empty" style={{ margin: 0 }}>{ui.share.noMembers}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: isModern ? '8px' : '0' }}>
              {sortedMembers.map(([uid, data]) => (
                <MemberRow
                  key={uid}
                  uid={uid}
                  data={data}
                  isSelf={uid === currentUser.uid}
                  isOwner={isOwner}
                  currentUserUid={currentUser.uid}
                  onRoleChange={handleRoleChange}
                  onRemove={handleRemoveMember}
                  ui={ui}
                  isModern={isModern}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="icon-btn" onClick={onClose} style={{ textTransform: 'var(--text-transform)' }}>
            {ui.share.closeBtn}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
