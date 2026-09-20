import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function PrivacyPage({ currentUser, onSignOut }) {
  return (
    <div className="app-layout">
      <SEO title="Privacy Policy" description="Privacy policy and data collection practices." />
      <Header user={currentUser} onSignOut={onSignOut} />
      <main className="main-content" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '8px' }}>Privacy Policy</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Last Updated: September 20, 2026</p>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>1. Information We Collect</h3>
          <p>We collect your account data (such as name and email) and the user content you provide (such as saved URLs, labels, and reminders).</p>
        </section>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>2. How We Use Your Data</h3>
          <p>We use your data strictly to provide and improve the service, manage your account, and sync your saved links and preferences across your devices.</p>
        </section>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>3. Third-Party Processing</h3>
          <p>We utilize trusted third-party services (such as Vercel for hosting and Firebase for database/authentication) as subprocessors to deliver our services securely.</p>
        </section>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>4. Data Retention</h3>
          <p>Your data is retained until you choose to delete your account.</p>
        </section>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>5. Your Rights</h3>
          <p>You have the right to access, correct, or erase your data at any time. For more details on your data rights under the DPDP Act, please visit our DPDP page.</p>
        </section>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>6. Cookies and Analytics</h3>
          <p>We use cookies solely for essential functional purposes (such as session management). <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 4px' }}>[TODO: confirm usage or state none for analytics]</span></p>
        </section>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>7. Contact Us</h3>
          <p>If you have any questions or concerns about this privacy policy, please contact us at: <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 4px' }}>[TODO: insert contact email]</span></p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
