import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsPage({ currentUser, onSignOut }) {
  return (
    <div className="app-layout">
      <Header user={currentUser} onSignOut={onSignOut} />
      <main className="main-content">
        <h2>Terms of Service</h2>
      </main>
      <Footer />
    </div>
  );
}
