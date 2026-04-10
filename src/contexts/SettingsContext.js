import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import db from '../config/firebase';

const SettingsContext = createContext(null);

// Default settings (fallback when user not signed in or no saved settings)
const DEFAULT_SETTINGS = {
  weightUnit: 'lbs',
  defaultSets: 4,
  defaultReps: 12,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Listen to auth state and load settings
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // User signed in - fetch their settings from Firebase
        try {
          const settingsDoc = await getDoc(doc(db, 'userSettings', currentUser.uid));
          if (settingsDoc.exists()) {
            setSettings({ ...DEFAULT_SETTINGS, ...settingsDoc.data() });
          } else {
            // No saved settings - use defaults
            setSettings(DEFAULT_SETTINGS);
          }
        } catch (error) {
          console.error('Error fetching user settings:', error);
          setSettings(DEFAULT_SETTINGS);
        }
      } else {
        // User signed out - use defaults
        setSettings(DEFAULT_SETTINGS);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update settings in Firebase
  const updateSettings = async (updates) => {
    if (!user) {
      console.warn('Cannot update settings: user not signed in');
      return false;
    }

    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    try {
      await setDoc(doc(db, 'userSettings', user.uid), newSettings, { merge: true });
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      // Revert on error
      setSettings(settings);
      return false;
    }
  };

  const value = {
    settings,
    loading,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook to use settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
