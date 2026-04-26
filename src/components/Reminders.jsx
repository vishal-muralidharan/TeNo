import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function Reminders({ user }) {
  const [text, setText] = useState('');
  const [label, setLabel] = useState('');
  const [reminders, setReminders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Modal State
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'reminders'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      data.sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      });

      setReminders(data);
    });

    return unsub;
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    setIsSubmitting(true);
    const cleanLabel = label.trim().toLowerCase();
    await addDoc(collection(db, 'users', user.uid, 'reminders'), {
      text: text.trim(),
      label: cleanLabel,
      createdAt: serverTimestamp()
    });

    setText('');
    setLabel('');
    setIsSubmitting(false);
  };

  const handleComplete = (id) => {
    setPendingDelete(id);
  };

  const confirmComplete = async () => {
    if (pendingDelete) {
      await deleteDoc(doc(db, 'users', user.uid, 'reminders', pendingDelete));
      setPendingDelete(null);
    }
  };

  const groupedReminders = reminders.reduce((groups, reminder) => {
    const labelKey = reminder.label ? reminder.label.trim().toLowerCase() : '';
    const sectionKey = labelKey || 'ungrouped';

    if (!groups[sectionKey]) {
      groups[sectionKey] = {
        key: sectionKey,
        label: labelKey,
        title: sectionKey === 'ungrouped' ? 'ungrouped' : labelKey,
        items: [],
      };
    }

    groups[sectionKey].items.push(reminder);
    return groups;
  }, {});

  const reminderSections = Object.values(groupedReminders)
    .map((section) => ({
      ...section,
      items: [...section.items].sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      }),
    }))
    .sort((a, b) => {
      if (a.key === 'ungrouped') return 1;
      if (b.key === 'ungrouped') return -1;
      return a.label.localeCompare(b.label);
    });

  const flattenedReminders = reminderSections.flatMap((section) =>
    section.items.map((reminder) => ({ reminder, sectionKey: section.key }))
  );

  const findReminderPosition = (reminderId) => flattenedReminders.findIndex((entry) => entry.reminder.id === reminderId);

  const moveReminderWithinSection = async (e, currentIndex, direction) => {
    e.stopPropagation();
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= flattenedReminders.length) return;

    const currentEntry = flattenedReminders[currentIndex];
    const targetEntry = flattenedReminders[targetIndex];
    if (currentEntry.sectionKey !== targetEntry.sectionKey) return;

    const current = currentEntry.reminder;
    const target = targetEntry.reminder;
    if (current.createdAt && target.createdAt) {
      await updateDoc(doc(db, 'users', user.uid, 'reminders', current.id), { createdAt: target.createdAt });
      await updateDoc(doc(db, 'users', user.uid, 'reminders', target.id), { createdAt: current.createdAt });
    }
  };

  return (
    <div className="tab-pane">
      <form className="input-group" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add new reminder here"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="text"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <button type="submit" disabled={isSubmitting || !text.trim()}>Add</button>
      </form>

      <h2 className="tab-title">Reminders</h2>

      {reminderSections.map((section) => (
        <section key={section.key} className="section-block">
          <h3 className="section-title">{section.title}</h3>
          <div className="list-container">
            {section.items.map((r) => {
              const globalIndex = findReminderPosition(r.id);
              const prevEntry = globalIndex > 0 ? flattenedReminders[globalIndex - 1] : null;
              const nextEntry = globalIndex < flattenedReminders.length - 1 ? flattenedReminders[globalIndex + 1] : null;
              const canMoveUp = globalIndex > 0 && prevEntry && prevEntry.sectionKey === section.key;
              const canMoveDown = globalIndex < flattenedReminders.length - 1 && nextEntry && nextEntry.sectionKey === section.key;

              return (
                <div key={r.id} className="list-item reminder-item">
                  <div className="item-content" style={{gap: '16px'}}>
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleComplete(r.id)}
                      />
                      <span className="checkmark"></span>
                    </label>
                    <div className="item-text-stack">
                      <span className="item-text" style={{whiteSpace: 'normal', wordBreak: 'break-word'}}>
                        {r.text}
                      </span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <div className="order-controls" style={{ display: 'flex', flexDirection: 'column', padding: '0 4px', gap: '2px' }}>
                      <button
                        className="icon-btn"
                        onClick={(e) => moveReminderWithinSection(e, globalIndex, -1)}
                        disabled={!canMoveUp}
                        style={{ padding: '0px', border: 'none', height: '14px', lineHeight: 1 }}
                      >
                        <ChevronUp size={14} opacity={canMoveUp ? 0.8 : 0.3} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={(e) => moveReminderWithinSection(e, globalIndex, 1)}
                        disabled={!canMoveDown}
                        style={{ padding: '0px', border: 'none', height: '14px', lineHeight: 1 }}
                      >
                        <ChevronDown size={14} opacity={canMoveDown ? 0.8 : 0.3} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {pendingDelete && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <p>Mark Reminder as Complete?</p>
            <div className="modal-actions">
              <button onClick={() => setPendingDelete(null)}>Cancel</button>
              <button className="btn-primary" onClick={confirmComplete}>Complete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
