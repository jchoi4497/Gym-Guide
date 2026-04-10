import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import db from '../../../config/firebase';

/**
 * Default settings for new users
 */
const DEFAULT_SETTINGS = {
  defaultSets: 4,
  defaultReps: 12,
  weightUnit: 'lbs',
};

/**
 * Custom hook to manage user settings in Firestore
 */
export function useUserSettings(user) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const settingsDoc = await getDoc(doc(db, 'userSettings', user.uid));
        if (settingsDoc.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsDoc.data() });
        } else {
          // Initialize with defaults
          await setDoc(doc(db, 'userSettings', user.uid), DEFAULT_SETTINGS);
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const updateSettings = async (newSettings) => {
    if (!user) return;

    try {
      setIsSaving(true);
      const updatedSettings = { ...settings, ...newSettings };
      await setDoc(doc(db, 'userSettings', user.uid), updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return { settings, isLoading, isSaving, updateSettings };
}
