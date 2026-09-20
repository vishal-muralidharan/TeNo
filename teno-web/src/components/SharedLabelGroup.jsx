import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { Trash2, Copy, Edit2, Check, ExternalLink, MoreVertical, Users } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { getUiConfig } from '../utils/uiConfig';
import GenerateInvite from './GenerateInvite';
import MembersModal from './MembersModal';

export default function SharedLabelGroup({ label, user }) {
  const { styleMode } = useTheme();
  const ui = getUiConfig(styleMode);
  
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState('');
  const [nickname, setNickname] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const role = label.members[user.uid];
  const isOwner = role === 'owner';
  const canEdit = isOwner || role === 'editor';

  useEffect(() => {
    const q = query(collection(db, 'shared_links'), where('labelId', '==', label.id));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() ?? (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis?.() ?? (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeA - timeB;
      });
      setLinks(data);
    });
    return () => unsub();
  }, [label.id]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim() || !nickname.trim() || !user || !canEdit) return;

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    let domain = '';
    try {
      const urlObj = new URL(cleanUrl);
      domain = urlObj.hostname;
    } catch (err) {
      domain = cleanUrl;
    }

    setIsSubmitting(true);
    await addDoc(collection(db, 'shared_links'), {
      url: cleanUrl,
      nickname: nickname.trim(),
      description: description.trim(),
      domain: domain,
      labelId: label.id,
      createdBy: user.uid,
      createdAt: serverTimestamp()
    });
    setUrl('');
    setNickname('');
    setDescription('');
    setIsSubmitting(false);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingItem.nickname.trim() || !editingItem.url.trim() || !canEdit) return;

    let cleanUrl = editingItem.url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    let domain = '';
    try {
      const urlObj = new URL(cleanUrl);
      domain = urlObj.hostname;
    } catch (err) {
      domain = cleanUrl;
    }

    await updateDoc(doc(db, 'shared_links', editingItem.id), {
       nickname: editingItem.nickname.trim(),
       url: cleanUrl,
       domain,
       description: editingItem.description.trim(),
    });
    setEditingItem(null);
  };

  const requestDeleteLink = async (id) => {
    if (!canEdit) return;
    await deleteDoc(doc(db, 'shared_links', id));
    setActiveMenu(null);
  };

  const deleteLabel = async () => {
    if (!isOwner) return;
    if (window.confirm('Are you sure you want to delete this shared label? This will delete all links inside it for everyone.')) {
      try {
        const batch = writeBatch(db);
        links.forEach(link => {
          batch.delete(doc(db, 'shared_links', link.id));
        });
        batch.delete(doc(db, 'shared_labels', label.id));
        await batch.commit();
      } catch (e) {
        console.error('Error deleting label:', e);
        alert('Failed to delete label.');
      }
    }
  };

  const handleOpen = (e, link) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.open(link.url, '_blank');
    setActiveMenu(null);
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <div className="list-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ margin: 0 }}>{label.name}</h2>
          <span className="label-chip" style={{ opacity: 0.8, fontSize: '0.75rem', textTransform: 'uppercase' }}>
            {role}
          </span>
          <button className="icon-btn" onClick={() => setIsMembersModalOpen(true)} title="Manage Members" style={{ padding: '4px', marginLeft: '8px' }}>
            <Users size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isOwner && (
            <>
              <GenerateInvite labelId={label.id} currentToken={label.inviteToken} />
              <button className="icon-btn danger" onClick={deleteLabel} title="Delete Label">
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {canEdit && (
        <>
          <button 
            type="button"
            className="toggle-form-btn" 
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            {isFormOpen ? ui.toggleForm.close : ui.toggleForm.open}
          </button>

          <div className={`collapsible-form ${isFormOpen ? 'open' : ''}`}>
            <form className="input-group" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Link Title"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
              <input
                type="url"
                placeholder="URL (e.g. https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : ui.addBtn.links}
              </button>
            </form>
          </div>
        </>
      )}

      {links.length === 0 ? (
        <p className="section-empty">No items yet</p>
      ) : (
        <div className="list-container">
          {links.map((link) => (
            <React.Fragment key={link.id}>
              <div
                className="list-item"
                onClick={(e) => handleOpen(e, link)}
                style={{ cursor: 'pointer' }}
              >
                <div className="item-content">
                  <img
                    src={`https://s2.googleusercontent.com/s2/favicons?domain=${link.domain}&sz=64`}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    alt="favicon"
                    className="favicon"
                  />
                  <div className="fallback-icon" style={{ display: 'none', width: '24px', height: '24px', alignItems: 'center', justifyContent: 'center', backgroundColor: '#333', color: '#fff', fontSize: '14px', fontWeight: '700', flexShrink: 0, textTransform: 'uppercase' }}>
                    {link.nickname ? link.nickname.charAt(0) : '?'}
                  </div>
                  <div className="item-text-stack">
                    <span className="item-text">{link.nickname}</span>
                    {link.description && <span className="item-desc">{link.description}</span>}
                  </div>
                </div>

                <div className="item-actions">
                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(link.url);
                      setCopiedId(link.id);
                      setTimeout(() => setCopiedId(null), 1500);
                    }}
                    title="Copy URL"
                  >
                    {copiedId === link.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>

                  <div className="menu-wrapper">
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === link.id ? null : link.id);
                      }}
                    >
                      <MoreVertical size={14} />
                    </button>
                    {activeMenu === link.id && (
                      <div className="dropdown-menu dropdown-menu-down" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => handleOpen(e, link, true)}>
                          <ExternalLink size={14} /> New Window
                        </button>
                        {canEdit && (
                          <>
                            <button onClick={() => { setEditingItem(link); setActiveMenu(null); }}>
                              <Edit2 size={14} /> Edit
                            </button>
                            <button className="danger" onClick={() => requestDeleteLink(link.id)}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {editingItem && editingItem.id === link.id && (
                <form className="edit-form" onSubmit={handleEditSave} onClick={(e) => e.stopPropagation()}>
                  <div className="edit-form-row">
                    <input
                      type="text"
                      value={editingItem.nickname}
                      onChange={(e) => setEditingItem({ ...editingItem, nickname: e.target.value })}
                      placeholder="Title"
                      autoFocus
                      required
                    />
                    <input
                      type="url"
                      value={editingItem.url}
                      onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                      placeholder="URL"
                      required
                    />
                  </div>
                  <div className="edit-form-row">
                    <input
                      type="text"
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      placeholder="Description"
                    />
                  </div>
                  <div className="edit-actions">
                    <button type="button" className="cancel-btn" onClick={() => setEditingItem(null)}>Cancel</button>
                    <button type="submit" className="save-btn">Save</button>
                  </div>
                </form>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      {isMembersModalOpen && (
        <MembersModal
          label={label}
          currentUser={user}
          onClose={() => setIsMembersModalOpen(false)}
        />
      )}
    </div>
  );
}
