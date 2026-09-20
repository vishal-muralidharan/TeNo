import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function TermsAndConditionsPage({ currentUser, onSignOut }) {
  return (
    <div className="app-layout">
      <SEO title="Terms and Conditions" description="Terms and conditions for using the service." />
      <Header user={currentUser} onSignOut={onSignOut} />
      <main className="main-content" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '8px' }}>Terms and Conditions</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Last Updated: <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 4px' }}>[TODO: Insert Last Updated date]</span></p>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>1. Eligibility</h3>
          <p>You must be at least <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 4px' }}>[TODO: confirm minimum age, e.g., 18]</span> years old to use this service.</p>
        </section>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>2. Modifications</h3>
          <p>We reserve the right to modify or suspend the service at any time. Continued use of the service following any modifications constitutes your acceptance of the updated terms.</p>
        </section>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>3. Governing Law</h3>
          <p>These terms and conditions are governed by and construed in accordance with the laws of <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 4px' }}>[TODO: specify jurisdiction]</span>.</p>
        </section>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>4. Severability</h3>
          <p>If any provision of these terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that the remaining terms shall otherwise remain in full force and effect.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
