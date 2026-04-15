import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ExternalLink, MoreVertical, Trash2, Globe, Star, Edit2 } from 'lucide-react';

export default function LinkStorer({ collectionName = 'saved_links', title = 'Saved Links' }) {
  const [url, setUrl] = useState('');
  const [nickname, setNickname] = useState('');
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  // Custom Modal State
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort favorites to the top locally
      data.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return 0;
      });
      setLinks(data);
    });
    return unsub;
  }, [collectionName]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim() || !nickname.trim()) return;

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
    await addDoc(collection(db, collectionName), {
      url: cleanUrl,
      nickname: nickname.trim(),
      description: description.trim(),
      domain: domain,
      isFavorite: false,
      createdAt: serverTimestamp()
    });
    setUrl('');
    setNickname('');
    setDescription('');
    setIsSubmitting(false);
  };

  const handleOpen = (linkUrl, newWindow = false) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      if (newWindow) {
        chrome.windows.create({ url: linkUrl });
      } else {
        chrome.tabs.create({ url: linkUrl });
      }
    } else {
      window.open(linkUrl, '_blank');
    }
    setActiveMenu(null);
  };

  const toggleFavorite = async (id, currentFav) => {
    await updateDoc(doc(db, collectionName, id), {
      isFavorite: !currentFav
    });
  };

  const requestDelete = (id) => {
    setPendingDelete(id);
    setActiveMenu(null);
  }

  const confirmDelete = async () => {
    if (pendingDelete) {
      await deleteDoc(doc(db, collectionName, pendingDelete));
      setPendingDelete(null);
    }
  };

  const requestEdit = (link) => {
    setEditingItem({ id: link.id, nickname: link.nickname, description: link.description || '' });
    setActiveMenu(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingItem.nickname.trim()) return;
    
    await updateDoc(doc(db, collectionName, editingItem.id), {
       nickname: editingItem.nickname.trim(),
       description: editingItem.description.trim()
    });
    setEditingItem(null);
  };

  return (
    <div className="tab-pane">
      <form className="input-group" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="meta-input"
        />
        <button type="submit" disabled={isSubmitting || !url || !nickname}>Save</button>
      </form>

      <h2 className="tab-title">{title}</h2>

      <div className="list-container">
        {links.map((link) => (
          <div key={link.id} className="list-item">
            <div className="item-content" onClick={() => handleOpen(link.url)}>
              <img
                src={`https://s2.googleusercontent.com/s2/favicons?domain=${link.domain}&sz=32`}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                alt="favicon"
                className="favicon"
              />
              <Globe className="fallback-icon" size={16} style={{ display: 'none' }} />

              <div className="item-text-stack">
                <span className="item-text">{link.nickname}</span>
                {link.description && <span className="item-desc">{link.description}</span>}
              </div>
            </div>

            <div className="item-actions">
              <button
                className={`icon-btn ${link.isFavorite ? 'favorited' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleFavorite(link.id, link.isFavorite); }}
              >
                <Star size={16} fill={link.isFavorite ? 'var(--color-accent)' : 'none'} />
              </button>

              <div className="menu-wrapper">
                <button
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === link.id ? null : link.id);
                  }}
                >
                  <MoreVertical size={16} />
                </button>
                {activeMenu === link.id && (
                  <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleOpen(link.url, true)}>
                      <ExternalLink size={14} /> New Window
                    </button>
                    <button onClick={() => requestEdit(link)}>
                      <Edit2 size={14} /> Edit
                    </button>
                    <button className="danger" onClick={() => requestDelete(link.id)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {pendingDelete && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <p>Delete completely?</p>
            <div className="modal-actions">
              <button onClick={() => setPendingDelete(null)}>Cancel</button>
              <button className="danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <p style={{marginBottom: "16px"}}>Edit Item</p>
            <form onSubmit={handleEditSave} className="input-group">
               <input 
                 type="text" 
                 value={editingItem.nickname} 
                 onChange={e => setEditingItem({...editingItem, nickname: e.target.value})}
               />
               <textarea 
                 value={editingItem.description}
                 onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                 rows={2}
                 className="meta-input"
                 placeholder="Description..."
               />
               <div className="modal-actions" style={{marginTop: "8px"}}>
                 <button type="button" onClick={() => setEditingItem(null)}>Cancel</button>
                 <button type="submit" className="btn-primary" disabled={!editingItem.nickname.trim()}>Save</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
