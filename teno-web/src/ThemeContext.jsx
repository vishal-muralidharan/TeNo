import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// ── Synchronous bootstrap ────────────────────────────────────────────────────
// Read localStorage immediately (before any React render) so the correct
// data-theme / data-style attributes are stamped on <html> from frame 0.
// This prevents ANY flash of the wrong loader or wrong theme.
const _bootstrapTheme = localStorage.getItem('theme') ||
  (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
const _bootstrapStyle = localStorage.getItem('styleMode') || 'minimal';
document.documentElement.setAttribute('data-theme', _bootstrapTheme);
document.documentElement.setAttribute('data-style', _bootstrapStyle);
// ────────────────────────────────────────────────────────────────────────────

export const ThemeProvider = ({ children }) => {
  // Lazy initialisers — read localStorage once synchronously so the first
  // render already has the correct values (no extra re-render / flash).
  const [theme, setThemeState] = useState(() => _bootstrapTheme);
  const [styleMode, setStyleModeState] = useState(() => _bootstrapStyle);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [styleModeChanging, setStyleModeChanging] = useState(false);
  const styleModeChangeTimerRef = useRef(null);

  // Apply theme attributes to document
  const applyTheme = (newTheme, newStyleMode) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.setAttribute('data-style', newStyleMode);
  };

  // Sync state to local storage and document
  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme, styleMode);

    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          preferences: { theme: newTheme, styleMode }
        }, { merge: true });
      } catch (error) {
        console.error("Error saving theme to Firestore:", error);
      }
    }
  };

  const setStyleMode = async (newStyleMode) => {
    // Show loading screen for style mode transitions
    if (styleModeChangeTimerRef.current) clearTimeout(styleModeChangeTimerRef.current);
    setStyleModeChanging(true);

    setStyleModeState(newStyleMode);
    localStorage.setItem('styleMode', newStyleMode);
    applyTheme(theme, newStyleMode);

    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          preferences: { theme, styleMode: newStyleMode }
        }, { merge: true });
      } catch (error) {
        console.error("Error saving styleMode to Firestore:", error);
      }
    }

    // Keep loading screen up long enough for new styles to settle
    styleModeChangeTimerRef.current = setTimeout(() => {
      setStyleModeChanging(false);
    }, 1800);
  };

  useEffect(() => {
    const initTheme = async (user) => {
      let initialTheme = null;
      let initialStyleMode = null;

      // 1. Try Firestore if authenticated
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().preferences) {
            initialTheme = docSnap.data().preferences.theme;
            initialStyleMode = docSnap.data().preferences.styleMode;
          }
        } catch (error) {
          console.error("Error fetching preferences from Firestore:", error);
        }
      }

      // 2. Fallback to LocalStorage
      if (!initialTheme) initialTheme = localStorage.getItem('theme');
      if (!initialStyleMode) initialStyleMode = localStorage.getItem('styleMode');

      // 3. Fallback to System Preferences or Defaults
      if (!initialTheme) {
        initialTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      if (!initialStyleMode) {
        initialStyleMode = 'minimal';
      }

      setThemeState(initialTheme);
      setStyleModeState(initialStyleMode);
      applyTheme(initialTheme, initialStyleMode);
      setLoading(false);
      
      // Ensure the DOM has time to paint the new attributes before fading out
      requestAnimationFrame(() => {
        setIsThemeReady(true);
      });
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      initTheme(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, styleMode, setTheme, setStyleMode, loading, isThemeReady, styleModeChanging }}>
      {children}
    </ThemeContext.Provider>
  );
};
