import React from 'react';

const LoadingScreen = ({ styleMode = 'minimal' }) => {
  if (styleMode === 'modern') {
    return (
      <div className="fullscreen-loading fullscreen-loading--modern">
        <div className="loading-modern-inner">
          <span className="loading-modern-logo">TeNo</span>
          <div className="loading-modern-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  // Minimalist: terminal-style
  return (
    <div className="fullscreen-loading">
      <div className="loading-pulse">system_init...</div>
    </div>
  );
};

export default LoadingScreen;
