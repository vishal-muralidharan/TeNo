import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

export default function TermsAgreementModal({ user, onClose }) {
  const { styleMode } = useTheme();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const isModern = styleMode === 'modern';

  const handleAccept = async () => {
    if (!agreed) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        agreed_to_terms: true,
        updatedAt: new Date().toISOString()
      });
      if (onClose) onClose();
    } catch (error) {
      console.error('Error accepting terms:', error);
      setLoading(false);
    }
  };

  return (
    <div className={`confirm-modal-overlay ${isModern ? 'confirm-modal-overlay--modern' : ''}`} style={{ zIndex: 9999 }}>
      <div className={`confirm-modal ${isModern ? 'confirm-modal--modern' : ''}`} style={{ width: '90%', maxWidth: '500px', padding: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Updated Legal Terms</h3>
        <p style={{ marginBottom: '16px', lineHeight: '1.5', fontSize: '0.95rem' }}>
          We've updated our legal terms to better protect your privacy and outline our services.
          Please review the following documents:
        </p>
        <ul style={{ paddingLeft: '20px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li><Link to="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</Link></li>
          <li><Link to="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms and Conditions</Link></li>
          <li><Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link></li>
        </ul>
        
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '24px', cursor: 'pointer', fontSize: '0.9rem' }}>
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
            style={{ marginTop: '4px' }}
          />
          <span>I have read and agree to the Terms of Service, Terms and Conditions, and Privacy Policy.</span>
        </label>

        <div className="confirm-modal-actions" style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            className={`btn-primary ${isModern ? 'confirm-modal-confirm--modern' : ''}`}
            onClick={handleAccept}
            disabled={!agreed || loading}
            style={{
              opacity: (!agreed || loading) ? 0.5 : 1,
              cursor: (!agreed || loading) ? 'not-allowed' : 'pointer',
              padding: '8px 24px',
            }}
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
