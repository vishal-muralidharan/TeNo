import React, { useState, useEffect, useRef } from 'react'
import LinkStorer from './components/LinkStorer'
import Reminders from './components/Reminders'
import Timer from './components/Timer'

function App() {
  const [activeTab, setActiveTab] = useState(0)
  const [prevTab, setPrevTab] = useState(0)
  const appContainerRef = useRef(null)

  const tabs = [
    { id: 'links', label: 'Links', component: <LinkStorer collectionName="saved_links" title="Saved Links" /> },
    { id: 'cart', label: 'Cart', component: <LinkStorer collectionName="cart_items" title="Cart" /> },
    { id: 'reminders', label: 'Reminders', component: <Reminders /> },
    { id: 'timer', label: 'Timer', component: <Timer /> }
  ]

  const handleTabSwitch = (index) => {
    if (activeTab === index) return;
    setPrevTab(activeTab)
    setActiveTab(index)
  }

  useEffect(() => {
    const focusApp = () => {
      setTimeout(() => {
        if (appContainerRef.current) {
          appContainerRef.current.focus();
        }
        window.focus();
      }, 50);
    };
    
    focusApp();
    
    const visibilityListener = () => {
      if (document.visibilityState === 'visible') {
        focusApp();
      }
    };
    
    document.addEventListener("visibilitychange", visibilityListener);
    return () => document.removeEventListener("visibilitychange", visibilityListener);
  }, []);

  return (
    <div className="app-layout" ref={appContainerRef} tabIndex={-1} style={{ outline: 'none' }}>
      <header className="app-header">
        <div className="brand">
          <h1>teno</h1>
        </div>
      </header>

      <nav className="top-nav">
        {tabs.map((tab, idx) => (
          <button 
            key={tab.id} 
            className={activeTab === idx ? 'active' : ''}
            onClick={() => handleTabSwitch(idx)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="main-content slider-container">
        {tabs.map((tab, idx) => {
          let positionClass = 'slide-hidden';
          if (idx === activeTab) {
            positionClass = 'slide-active';
          } else if (idx < activeTab) {
            positionClass = 'slide-left';
          } else if (idx > activeTab) {
            positionClass = 'slide-right';
          }

          return (
            <div key={tab.id} className={`slide-pane ${positionClass}`}>
              {React.cloneElement(tab.component, { isActive: activeTab === idx })}
            </div>
          )
        })}
      </main>
    </div>
  )
}

export default App
