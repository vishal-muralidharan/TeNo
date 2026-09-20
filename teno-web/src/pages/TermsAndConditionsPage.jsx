import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsAndConditionsPage({ currentUser, onSignOut }) {
  return (
    <div className="app-layout">
      <Header user={currentUser} onSignOut={onSignOut} />
      <main className="main-content">
        <h2>Terms and Conditions</h2>
      </main>
      <Footer />
    </div>
  );
}
