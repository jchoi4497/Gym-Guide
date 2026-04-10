import { useState } from 'react';
import { auth } from '../config/firebase';
import Navbar from '../components/Navbar';
import StatsTab from '../components/profile/stats/StatsTab';
import SettingsTab from '../components/profile/settings/SettingsTab';

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('settings');
  const user = auth.currentUser;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-300 to-stone-300 font-serif">
        <Navbar />
        <div className="flex items-center justify-center mt-20 text-red-600">
          Please log in to view your profile.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 to-stone-300 font-serif pb-32">
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
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
              {user.displayName}
            </h1>
            <p className="text-lg text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-4 font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'border-b-4 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-3 px-4 font-semibold transition-colors ${
                activeTab === 'stats'
                  ? 'border-b-4 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Stats
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'stats' && <StatsTab user={user} />}
        {activeTab === 'settings' && <SettingsTab user={user} />}
      </div>
    </div>
  );
}

export default ProfilePage;
