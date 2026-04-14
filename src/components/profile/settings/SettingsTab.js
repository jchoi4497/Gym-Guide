import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import db from '../../../config/firebase';
import { FIREBASE_FIELDS } from '../../../config/constants';
import { useSettings } from '../../../contexts/SettingsContext';
import AccountInfo from './AccountInfo';
import ThemeSelector from './ThemeSelector';
import WorkoutPreferences from './WorkoutPreferences';
import UnitPreference from './UnitPreference';
import DataManagement from './DataManagement';

function SettingsTab({ user }) {
  const { settings, loading, updateSettings } = useSettings();
  const [memberSince, setMemberSince] = useState(null);

  // Fetch member since date from first workout
  useEffect(() => {
    const fetchMemberSince = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'workoutLogs'),
          where(FIREBASE_FIELDS.USER_ID, '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.docs.length > 0) {
          const workouts = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return data.date?.toDate ? data.date.toDate() : new Date(data.date?.seconds * 1000);
          });

          workouts.sort((a, b) => a - b);
          setMemberSince(workouts[0]);
        }
      } catch (error) {
        console.error('Error fetching member since:', error);
      }
    };

    fetchMemberSince();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-xl text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AccountInfo user={user} memberSince={memberSince} />
      <ThemeSelector />
      <WorkoutPreferences settings={settings} onUpdate={updateSettings} />
      <UnitPreference settings={settings} onUpdate={updateSettings} />
      <DataManagement user={user} />
    </div>
  );
}

export default SettingsTab;
