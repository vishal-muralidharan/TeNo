import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Trash2, Globe, Star, ChevronUp, ChevronDown } from 'lucide-react';

export default function LinkStorer({ collectionName = 'saved_links', title = 'Saved Links', isActive = true, user }) {
  const [url, setUrl] = useState('');
  const [nickname, setNickname] = useState('');
  const [description, setDescription] = useState('');
  const [label, setLabel] = useState('');
  const [links, setLinks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Custom Modal State
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'users', user.uid, collectionName), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Sort logic combining both createdAt asc + favorites
      data.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      });
      
      setLinks(data);
    });
    
    let storageListener = null;

    // Check initial pending website from background script
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['pendingWebsiteAdd'], (result) => {
        if (result.pendingWebsiteAdd) {
          const { url, title } = result.pendingWebsiteAdd;
          setUrl(url || '');
          setNickname(title || '');
          setIsFormOpen(true);
          chrome.storage.local.remove('pendingWebsiteAdd');
        }
      });

      // Listen for commands triggering when panel is already open
      storageListener = (changes, areaName) => {
        if (areaName === 'local' && changes.pendingWebsiteAdd && changes.pendingWebsiteAdd.newValue) {
          const { url, title } = changes.pendingWebsiteAdd.newValue;
          setUrl(url || '');
          setNickname(title || '');
          setIsFormOpen(true);
          chrome.storage.local.remove('pendingWebsiteAdd');
        }
      };
      
      chrome.storage.onChanged.addListener(storageListener);
    }

    return () => {
      unsub();
      if (storageListener && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.removeListener(storageListener);
      }
    };
  }, [collectionName, user]);

  const normalizeLabel = (value) => value.trim().toLowerCase();

  const groupedLinks = links.reduce((groups, link) => {
    const labelKey = link.label ? normalizeLabel(link.label) : '';
    const sectionKey = labelKey || (link.isFavorite ? 'favorites' : 'ungrouped');

    if (!groups[sectionKey]) {
      groups[sectionKey] = {
        key: sectionKey,
        label: labelKey,
        title: sectionKey === 'favorites' ? 'favourites' : sectionKey,
        items: [],
      };
    }

    groups[sectionKey].items.push(link);
    return groups;
  }, {});

  const displaySections = Object.values(groupedLinks)
    .map((section) => ({
      ...section,
      items: [...section.items].sort((a, b) => {
        if (section.key !== 'favorites') {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
        }

        const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      }),
    }))
    .sort((a, b) => {
      if (a.key === 'favorites') return -1;
      if (b.key === 'favorites') return 1;
      if (a.key === 'ungrouped') return 1;
      if (b.key === 'ungrouped') return -1;
      return a.label.localeCompare(b.label);
    });

  const flattenedDisplay = displaySections.flatMap((section) =>
    section.items.map((link) => ({
      link,
      sectionKey: section.key,
    }))
  );

  const findItemPosition = (itemId) => flattenedDisplay.findIndex((entry) => entry.link.id === itemId);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (!isActive) return;
      // Don't trigger if user is typing in an input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const keyIndex = parseInt(e.key) - 1;
      if (!isNaN(keyIndex) && keyIndex >= 0 && keyIndex < 9) {
        const entry = flattenedDisplay[keyIndex];
        if (entry) {
          handleOpen(entry.link.url);
        }
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [flattenedDisplay, isActive]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim() || !nickname.trim() || !user) return;

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
    const cleanLabel = label.trim().toLowerCase();
    await addDoc(collection(db, 'users', user.uid, collectionName), {
      url: cleanUrl,
      nickname: nickname.trim(),
      description: description.trim(),
      label: cleanLabel,
      domain: domain,
      isFavorite: false,
      createdAt: serverTimestamp()
    });
    setUrl('');
    setNickname('');
    setDescription('');
    setLabel('');
    setIsSubmitting(false);
  };

  const handleOpen = (linkUrl) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: linkUrl });
    } else {
      window.open(linkUrl, '_blank');
    }
  };

  const handleOpenInNewWindow = (linkUrl) => {
    if (typeof chrome !== 'undefined' && chrome.windows) {
      chrome.windows.create({ url: linkUrl });
    } else {
      window.open(linkUrl, '_blank');
    }
  };

  const toggleFavorite = async (id, currentFav) => {
    await updateDoc(doc(db, 'users', user.uid, collectionName, id), {
      isFavorite: !currentFav
    });
  };

  const requestDelete = (id) => {
    setPendingDelete(id);
  }

  const confirmDelete = async () => {
    if (pendingDelete) {
      await deleteDoc(doc(db, 'users', user.uid, collectionName, pendingDelete));
      setPendingDelete(null);
    }
  };

  const handleMoveWithinDisplay = async (e, currentIndex, direction) => {
    e.stopPropagation();
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= flattenedDisplay.length) return;

    const currentEntry = flattenedDisplay[currentIndex];
    const targetEntry = flattenedDisplay[targetIndex];
    if (currentEntry.sectionKey !== targetEntry.sectionKey) return;

    const current = currentEntry.link;
    const target = targetEntry.link;
    if (current.createdAt && target.createdAt) {
      await updateDoc(doc(db, 'users', user.uid, collectionName, current.id), { createdAt: target.createdAt });
      await updateDoc(doc(db, 'users', user.uid, collectionName, target.id), { createdAt: current.createdAt });
    }
  };

  const renderLinkCells = (sectionLinks, sectionKey = '') => {
    if (sectionLinks.length === 0) {
      return <p className="section-empty">No items yet</p>;
    }

    return (
      <div className="list-container">
        {sectionLinks.map((link) => {
          const globalIndex = findItemPosition(link.id);
          const previousEntry = globalIndex > 0 ? flattenedDisplay[globalIndex - 1] : null;
          const nextEntry = globalIndex < flattenedDisplay.length - 1 ? flattenedDisplay[globalIndex + 1] : null;
          const canMoveUp = globalIndex > 0 && previousEntry && previousEntry.sectionKey === sectionKey;
          const canMoveDown = globalIndex < flattenedDisplay.length - 1 && nextEntry && nextEntry.sectionKey === sectionKey;

          return (
            <React.Fragment key={link.id}>
              <div className="list-item">
                <div className="item-content" onClick={() => handleOpen(link.url)}>
                  <img
                    src={`https://s2.googleusercontent.com/s2/favicons?domain=${link.domain}&sz=32`}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                    alt="favicon"
                    className="favicon"
                    style={{ width: '16px', height: '16px' }}
                  />
                  <Globe className="fallback-icon" size={14} style={{ display: 'none' }} />

                  <div className="item-text-stack">
                    <span className="item-text">
                      {globalIndex < 9 && <span style={{ opacity: 0.5, marginRight: '6px', fontSize: '0.9em' }}>[{globalIndex + 1}]</span>}
                      {link.nickname}
                    </span>
                    {link.description && <span className="item-desc">{link.description}</span>}
                  </div>
                </div>

                <div className="item-actions">
                  <div className="order-controls" style={{ display: 'flex', flexDirection: 'column', padding: '0 2px', gap: '0px' }}>
                    <button
                      className="icon-btn"
                      onClick={(e) => handleMoveWithinDisplay(e, globalIndex, -1)}
                      disabled={!canMoveUp}
                      style={{ padding: '0px', border: 'none', height: '12px', lineHeight: 1 }}
                    >
                      <ChevronUp size={12} opacity={canMoveUp ? 0.8 : 0.3} />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={(e) => handleMoveWithinDisplay(e, globalIndex, 1)}
                      disabled={!canMoveDown}
                      style={{ padding: '0px', border: 'none', height: '12px', lineHeight: 1 }}
                    >
                      <ChevronDown size={12} opacity={canMoveDown ? 0.8 : 0.3} />
                    </button>
                  </div>

                  <button
                    className={`icon-btn ${link.isFavorite ? 'favorited' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(link.id, link.isFavorite); }}
                  >
                    <Star size={14} fill={link.isFavorite ? 'var(--color-accent)' : 'none'} />
                  </button>

                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInNewWindow(link.url);
                    }}
                    title="Open in new window"
                    aria-label="Open in new window"
                  >
                    New Window
                  </button>

                  <button
                    className="icon-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      requestDelete(link.id);
                    }}
                    title="Delete"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="tab-pane">
      <button 
        type="button"
        className="toggle-form-btn" 
        onClick={() => setIsFormOpen(!isFormOpen)}
      >
        &gt; [ {isFormOpen ? '- close' : '+ add_new'} ]
      </button>

      <div className={`collapsible-form ${isFormOpen ? 'open' : ''}`}>
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
          rows={1}
          className="meta-input"
        />
        <input
          type="text"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <button type="submit" disabled={isSubmitting || !url || !nickname}>Save</button>
        </form>
      </div>

      <h2 className="tab-title">{title}</h2>

      {displaySections.map((section) => (
        <section key={section.key} className="section-block">
          <h3 className="section-title">{section.title}</h3>
          {renderLinkCells(section.items, section.key)}
        </section>
      ))}

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
    </div>
  );
}
