import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import Navbar from '../components/Navbar';
import SocialsTab from '../components/profile/socials/SocialsTab';
import StatsTab from '../components/profile/stats/StatsTab';
import SettingsTab from '../components/profile/settings/SettingsTab';
import { useTheme } from '../contexts/ThemeContext';

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('socials');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.pageBg} font-serif`}>
        <Navbar />
        <div className={`flex items-center justify-center mt-20 ${theme.cardText}`}>
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen ${theme.pageBg} font-serif`}>
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-20 text-center">
          <h1 className={`text-3xl font-bold ${theme.headerText} mb-4`}>Sign In Required</h1>
          <p className={`text-xl ${theme.cardText} mb-6`}>Please sign in to view your profile.</p>
          <p className={theme.cardTextSecondary}>Use the navigation bar above to sign in with Google.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.pageBg} font-serif pb-32`}>
      <Navbar />

      {/* Profile Header */}
      <div className="px-4 sm:px-20">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-8">
          <img
            src={user.photoURL}
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg"
          />
          <div className="text-center sm:text-left">
            <h1 className={`text-4xl sm:text-5xl font-bold ${theme.headerText} mb-2`}>
              {user.displayName}
            </h1>
            <p className={`text-lg ${theme.cardTextSecondary}`}>{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={`border-b ${theme.cardBorder} mb-6`}>
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('socials')}
              className={`py-3 px-4 font-semibold transition-colors ${
                activeTab === 'socials'
                  ? `border-b-4 border-gray-400 ${theme.headerText}`
                  : `${theme.headerText} opacity-60 hover:opacity-100`
              }`}
            >
              Socials
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-3 px-4 font-semibold transition-colors ${
                activeTab === 'stats'
                  ? `border-b-4 border-gray-400 ${theme.headerText}`
                  : `${theme.headerText} opacity-60 hover:opacity-100`
              }`}
            >
              Stats
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-4 font-semibold transition-colors ${
                activeTab === 'settings'
                  ? `border-b-4 border-gray-400 ${theme.headerText}`
                  : `${theme.headerText} opacity-60 hover:opacity-100`
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'socials' && <SocialsTab user={user} />}
        {activeTab === 'stats' && <StatsTab user={user} />}
        {activeTab === 'settings' && <SettingsTab user={user} />}
      </div>
    </div>
  );
}

export default ProfilePage;
