import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { getUiConfig } from '../utils/uiConfig';

export default function Header({ user, onSignOut }) {
  const navigate = useNavigate();
  const { styleMode } = useTheme();
  const ui = getUiConfig(styleMode);
  
  return (
    <header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)', background: 'color-mix(in srgb, var(--bg-app) 80%, transparent)' }}>
      <div className="brand">
        <h1 className="brand-logo-text" onClick={() => navigate(user ? '/app' : '/')} style={{ cursor: 'pointer' }}>
          {ui.logo}
        </h1>
        <div className="topbar-actions">
          {user ? (
            <>
              <button type="button" className="topbar-action-btn" onClick={() => navigate('/settings')}>
                {ui.icons.settings} {ui.nav.settings}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
