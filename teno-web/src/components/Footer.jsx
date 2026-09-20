import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ padding: '20px', textAlign: 'center', color: 'white', fontSize: '0.9rem' }}>
      <p>&copy; {year} TeNo. All rights reserved.</p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
        <Link to="/terms" style={{ color: 'white' }}>Terms of Service</Link>
        <Link to="/privacy" style={{ color: 'white' }}>Privacy Policy</Link>
      </div>
    </footer>
  );
}
