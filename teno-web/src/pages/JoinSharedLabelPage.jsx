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
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to join label');
        }

        setStatus('Successfully joined! Redirecting...');
        
        setTimeout(() => {
          navigate(`/dashboard`);
        }, 1500);

      } catch (err) {
        console.error(err);
        setError(err.message);
        setStatus('');
      }
    });

    return () => unsubscribe();
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Join Shared Label</h2>
        
        {status && <p className="text-blue-600 dark:text-blue-400">{status}</p>}
        
        {error && (
          <div className="mt-4">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
