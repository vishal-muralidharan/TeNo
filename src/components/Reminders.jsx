import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Edit2 } from 'lucide-react';

export default function Reminders() {
  const [text, setText] = useState('');
  const [reminders, setReminders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Modal State
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editingReminder, setEditingReminder] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'reminders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    await addDoc(collection(db, 'reminders'), {
      text: text.trim(),
      createdAt: serverTimestamp()
    });
    setText('');
    setIsSubmitting(false);
  };

  const handleComplete = (id) => {
    setPendingDelete(id);
  };

  const confirmComplete = async () => {
    if (pendingDelete) {
      await deleteDoc(doc(db, 'reminders', pendingDelete));
      setPendingDelete(null);
    }
  };

  const requestEdit = (r) => {
    setEditingReminder({ id: r.id, text: r.text });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingReminder.text.trim()) return;
    await updateDoc(doc(db, 'reminders', editingReminder.id), { text: editingReminder.text.trim() });
    setEditingReminder(null);
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
        <button type="submit" disabled={isSubmitting || !text.trim()}>Add</button>
      </form>

      <h2 className="tab-title">Reminders</h2>

      <div className="list-container">
        {reminders.map((r) => (
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
              <span className="item-text" style={{whiteSpace: 'normal', wordBreak: 'break-word'}}>{r.text}</span>
            </div>
            <div className="item-actions">
              <button className="icon-btn" onClick={() => requestEdit(r)}>
                <Edit2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

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

      {editingReminder && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <p style={{marginBottom: "16px"}}>Edit Reminder</p>
            <form onSubmit={handleEditSave} className="input-group">
               <input 
                 type="text" 
                 value={editingReminder.text} 
                 onChange={e => setEditingReminder({...editingReminder, text: e.target.value})}
               />
               <div className="modal-actions" style={{marginTop: "8px"}}>
                 <button type="button" onClick={() => setEditingReminder(null)}>Cancel</button>
                 <button type="submit" className="btn-primary" disabled={!editingReminder.text.trim()}>Save</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
