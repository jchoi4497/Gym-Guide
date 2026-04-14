import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import db from '../config/firebase';
import { getTheme, DEFAULT_THEME } from '../config/themes';

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(DEFAULT_THEME);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const theme = getTheme(themeId);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Load user's theme preference from Firestore
        try {
          const settingsDoc = await getDoc(doc(db, 'userSettings', currentUser.uid));
          if (settingsDoc.exists()) {
            const savedTheme = settingsDoc.data()?.theme || DEFAULT_THEME;
            setThemeId(savedTheme);
          }
        } catch (error) {
          console.error('Error loading theme preference:', error);
        }
      } else {
        // Not logged in - use default theme
        setThemeId(DEFAULT_THEME);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const changeTheme = async (newThemeId) => {
    setThemeId(newThemeId);

    // Save to Firestore if user is logged in
    if (user) {
      try {
        await setDoc(
          doc(db, 'userSettings', user.uid),
          { theme: newThemeId },
          { merge: true }
        );
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    }
  };

  const value = {
    theme,
    themeId,
    changeTheme,
    loading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
