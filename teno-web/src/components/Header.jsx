import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header({ user, onSignOut }) {
  const navigate = useNavigate();
  return (
    <header className="app-header">
      <div className="brand">
        <h1 className="brand-logo-text" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          TeNo
        </h1>
      </div>
    </header>
  );
}
