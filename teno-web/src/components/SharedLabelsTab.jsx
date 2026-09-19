import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import SharedLabelGroup from './SharedLabelGroup';
import { useTheme } from '../ThemeContext';
import { getUiConfig } from '../utils/uiConfig';

export default function SharedLabelsTab({ user, isActive }) {
  const { styleMode } = useTheme();
  const ui = getUiConfig(styleMode);
  
  const [labels, setLabels] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (!user || !isActive) return;

    // Securely query labels where the user is a member
    const q = query(
      collection(db, 'shared_labels'),
      where(`members.${user.uid}`, 'in', ['owner', 'editor', 'viewer'])
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort alphabetically by name
      data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setLabels(data);
    });

    return () => unsub();
  }, [user, isActive]);

  const handleCreateLabel = async (e) => {
    e.preventDefault();
    if (!newLabelName.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'shared_labels'), {
        name: newLabelName.trim(),
        ownerId: user.uid,
        inviteToken: crypto.randomUUID().split('-')[0], // pre-generate short invite token
        settings: { inviteAny: true },
        members: {
          [user.uid]: 'owner' // creator is always the owner
        },
        createdAt: serverTimestamp()
      });
      setNewLabelName('');
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error creating label:', err);
      alert('Failed to create shared label.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="tab-pane" style={{ paddingBottom: '100px' }}>
      
      <button 
        type="button"
        className="toggle-form-btn" 
        onClick={() => setIsFormOpen(!isFormOpen)}
      >
        {isFormOpen ? ui.toggleForm.close : ui.toggleForm.open}
      </button>

      <div className={`collapsible-form ${isFormOpen ? 'open' : ''}`}>
        <form className="input-group" onSubmit={handleCreateLabel}>
          <input
            type="text"
            placeholder="Label Name (e.g. Project Alpha)"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            required
            autoFocus
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Label'}
          </button>
        </form>
      </div>

      {labels.length === 0 ? (
        <p className="section-empty" style={{ marginTop: '24px' }}>No shared labels yet. Create one or ask for an invite link!</p>
      ) : (
        <div style={{ marginTop: '24px' }}>
          {labels.map(label => (
            <SharedLabelGroup key={label.id} label={label} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
