import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPage({ currentUser, onSignOut }) {
  return (
    <div className="app-layout">
      <Header user={currentUser} onSignOut={onSignOut} />
      <main className="main-content">
        <h2>Privacy Policy</h2>
      </main>
      <Footer />
    </div>
  );
}
