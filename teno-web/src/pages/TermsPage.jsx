import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function TermsPage({ currentUser, onSignOut }) {
  return (
    <div className="app-layout">
      <SEO title="Terms of Service" description="Terms of service and acceptable use policy." />
      <Header user={currentUser} onSignOut={onSignOut} />
      <main className="main-content" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '8px' }}>Terms of Service</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Last Updated: September 20, 2026</p>
        
        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>1. Description of Service</h3>
          <p>TeNo provides a personal link management and collaboration tool that allows users to save, organize, and share URLs, as well as manage simple tasks and reminders.</p>
        </section>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>2. Ownership of Content</h3>
          <p>You retain full intellectual property rights to the links and content you save within TeNo. TeNo claims no ownership over your stored data.</p>
        </section>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>3. Acceptable Use</h3>
          <p>You agree not to use TeNo for storing or sharing illegal, harmful, or abusive content. You are solely responsible for the links you save and share.</p>
        </section>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>4. Disclaimer of Responsibility</h3>
          <p>TeNo is a tool for saving links. We are not responsible for the content of third-party URLs saved by users, nor do we endorse or verify the safety of such external sites.</p>
        </section>

        <section style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <h3>5. Limitation of Liability</h3>
          <p>The service is provided "AS IS" and "AS AVAILABLE". TeNo shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the service.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
