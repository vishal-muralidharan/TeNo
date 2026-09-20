import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  const location = useLocation();

  const links = [
    { path: '/terms', label: 'Terms of Service' },
    { path: '/terms-and-conditions', label: 'Terms and Conditions' },
    { path: '/privacy', label: 'Privacy Policy' },
    { path: '/dpdp', label: 'DPDP' }
  ];

  return (
    <footer style={{ padding: '20px', textAlign: 'center', color: 'white', fontSize: '0.9rem' }}>
      <p>&copy; {year} TeNo. All rights reserved.</p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
        {links
          .filter(link => link.path !== location.pathname)
          .map(link => (
            <Link key={link.path} to={link.path} style={{ color: 'white' }}>{link.label}</Link>
          ))}
      </div>
    </footer>
  );
}
