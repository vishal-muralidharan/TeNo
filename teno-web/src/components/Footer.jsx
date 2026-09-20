import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
      <p>&copy; {year} TeNo. All rights reserved.</p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
        <Link to="/terms">Terms of Service</Link>
        <Link to="/privacy">Privacy Policy</Link>
      </div>
    </footer>
  );
}
