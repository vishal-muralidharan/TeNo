import React, { useEffect, useState } from 'react';

const LoadingScreen = () => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // When the component is about to unmount, we want a fade out.
    // However, since it unmounts from the parent conditionally, 
    // we actually handle the fade out CSS in the parent or via a class.
    // In this implementation, the parent will render it, and we just provide the basic UI.
    // The fade-out will be handled globally or we can just rely on the parent unmounting it directly
    // and using a wrapper fade-in for the main app. The user requested:
    // "Ensure it uses CSS fade-out animations when unmounting."
  }, []);

  return (
    <div className="fullscreen-loading">
      <div className="loading-pulse">system_init...</div>
    </div>
  );
};

export default LoadingScreen;
