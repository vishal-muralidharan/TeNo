import React, { useState } from 'react';
import Header from '../components/Header';
import { exportUserData } from '../api/user';
import { useTheme } from '../ThemeContext';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function DPDPPage({ currentUser, onSignOut }) {
  const { styleMode } = useTheme();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `teno-data-export-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Data exported successfully.');
    } catch (error) {
      console.error(error);
      alert('Failed to export data: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="app-layout">
      <SEO title="Manage Data (DPDP)" description="Manage your data and privacy rights according to the DPDP Act." />
      <Header user={currentUser} onSignOut={onSignOut} />
      <main className="main-content" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', overflowY: 'auto' }}>
        <Link to="/settings" style={{ display: 'inline-block', marginBottom: '24px', color: 'var(--text-muted)' }}>← Back to Settings</Link>
        <h2 style={{ marginBottom: '24px' }}>Manage My Data (DPDP Act)</h2>
        
        <section style={{ marginBottom: '32px' }}>
          <h3>Data We Process</h3>
          <ul style={{ paddingLeft: '20px', marginTop: '12px', lineHeight: '1.6' }}>
            <li>Name and Email address (for authentication and account management).</li>
            <li>Saved URLs (links you choose to store).</li>
            <li>Labels (categories you create for organizing links).</li>
            <li>Reminders (tasks and notes you create).</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3>Your Rights (DPDP Act)</h3>
          <ul style={{ paddingLeft: '20px', marginTop: '12px', lineHeight: '1.6' }}>
            <li><strong>Right to Access:</strong> You can view all data we hold about you or download it below.</li>
            <li><strong>Right to Correction & Erasure:</strong> You can update your profile in Settings or delete your account entirely to erase your data.</li>
            <li><strong>Right of Grievance Redressal:</strong> Contact our Grievance Officer if you have privacy concerns.</li>
            <li><strong>Right to Nominate:</strong> You may nominate an individual to act on your behalf regarding your data in the event of death or incapacity.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3>Data Management Tools</h3>
          <p style={{ marginBottom: '12px', color: 'var(--text-muted)' }}>Download a complete copy of all your data stored in TeNo.</p>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handleExport}
            disabled={isExporting}
            style={{ opacity: isExporting ? 0.5 : 1, cursor: isExporting ? 'not-allowed' : 'pointer' }}
          >
            {isExporting ? 'Preparing Download...' : 'Download My Data (JSON)'}
          </button>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3>Grievance Officer</h3>
          <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', marginTop: '12px' }}>
            <p><strong>Name:</strong> <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 4px' }}>[TODO: Insert Name]</span></p>
            <p><strong>Designation:</strong> <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 4px' }}>[TODO: Insert Designation]</span></p>
            <p><strong>Email:</strong> <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 4px' }}>[TODO: Insert Email]</span></p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
