import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function JoinSharedLabelPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Checking authentication...');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Pass intent to come back here via state
        navigate('/login', { state: { returnTo: `/join/${token}` } });
        return;
      }

      try {
        setStatus('Joining shared label...');
        const idToken = await user.getIdToken();

        const response = await fetch('/api/joinSharedLabel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inviteToken: token,
            idToken: idToken,
            name: user.displayName || '',
            email: user.email || '',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to join label');
        }

        if (data.status === 'pending') {
          setStatus('Access requested. Waiting for owner approval.');
          // Don't redirect immediately, let them read the message.
        } else {
          setStatus('Successfully joined! Redirecting...');
          setTimeout(() => {
            navigate('/app', { state: { targetTab: 'shared' } });
          }, 1500);
        }

      } catch (err) {
        console.error(err);
        setError(err.message);
        setStatus('');
      }
    });

    return () => unsubscribe();
  }, [token, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-app)',
      padding: '20px',
      fontFamily: 'var(--font-family)',
      color: 'var(--text-primary)'
    }}>
      <div style={{
        padding: '32px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-card)',
        border: '1px var(--border-style) var(--border-color)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0' }}>Shared Label</h2>
        
        {status && (
          <p style={{ 
            color: status.includes('requested') ? 'var(--color-warning)' : (status.includes('Successfully') ? 'var(--color-success)' : 'var(--text-secondary)'),
            fontSize: '1rem',
            lineHeight: '1.5'
          }}>
            {status}
          </p>
        )}
        
        {status === 'Access requested. Waiting for owner approval.' && (
          <div style={{ marginTop: '8px' }}>
            <button 
              onClick={() => navigate('/app')}
              className="btn-primary"
              style={{ width: '100%', padding: '10px 16px' }}
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '8px' }}>
            <p style={{ color: 'var(--color-danger)', marginBottom: '16px', fontSize: '0.9rem', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-danger)' }}>
              {error}
            </p>
            <button 
              onClick={() => navigate('/app')}
              className="btn-primary"
              style={{ width: '100%', padding: '10px 16px' }}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
