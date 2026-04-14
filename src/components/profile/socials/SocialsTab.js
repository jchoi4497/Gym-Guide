import { useState } from 'react';
import FriendsList from './FriendsList';
import FriendRequests from './FriendRequests';
import AddFriend from './AddFriend';
import { useTheme } from '../../../contexts/ThemeContext';

function SocialsTab({ user }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'requests'
  const [requestCount, setRequestCount] = useState(0);
  const { theme } = useTheme();

  const handleRequestHandled = () => {
    // Trigger refresh of friends list when request is accepted
    setRefreshKey((prev) => prev + 1);
  };

  const handleRequestCountChange = (count) => {
    setRequestCount(count);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Add Friend & Friend Requests Combined */}
      <div className={`${theme.cardBg} rounded-xl shadow-md p-6 ${theme.cardBorder}`}>
        {/* Tabs */}
        <div className={`flex gap-4 mb-6 border-b ${theme.cardBorder}`}>
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === 'add'
                ? `border-b-2 border-gray-400 ${theme.cardText}`
                : `${theme.cardText} opacity-60 hover:opacity-100`
            }`}
          >
            Add Friends
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-2 px-4 font-semibold transition-colors relative ${
              activeTab === 'requests'
                ? `border-b-2 border-gray-400 ${theme.cardText}`
                : `${theme.cardText} opacity-60 hover:opacity-100`
            }`}
          >
            Friend Requests
            {requestCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {requestCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className={activeTab === 'add' ? '' : 'hidden'}>
          <AddFriend userId={user.uid} />
        </div>
        <div className={activeTab === 'requests' ? '' : 'hidden'}>
          <FriendRequests
            userId={user.uid}
            onRequestHandled={handleRequestHandled}
            onRequestCountChange={handleRequestCountChange}
          />
        </div>
      </div>

      {/* My Friends - Separate Card */}
      <div className={`${theme.cardBg} rounded-xl shadow-md p-6 ${theme.cardBorder}`}>
        <h3 className={`text-xl font-bold ${theme.cardText} mb-4`}>My Friends</h3>
        <FriendsList key={refreshKey} userId={user.uid} />
      </div>

      {/* Coming Soon Features */}
      <div className={`${theme.cardBg} rounded-xl shadow-md p-6 ${theme.cardBorder}`}>
        <h3 className={`text-lg font-semibold ${theme.cardText} mb-4`}>Coming Soon</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`border ${theme.cardBorder} rounded-lg p-4 ${theme.cardBgSecondary}`}>
            <h4 className={`font-semibold ${theme.cardText} mb-2`}>🏆 Leaderboards</h4>
            <p className={`text-sm ${theme.cardTextSecondary}`}>Compete with friends in challenges</p>
          </div>
          <div className={`border ${theme.cardBorder} rounded-lg p-4 ${theme.cardBgSecondary}`}>
            <h4 className={`font-semibold ${theme.cardText} mb-2`}>📊 Share Progress</h4>
            <p className={`text-sm ${theme.cardTextSecondary}`}>Share your fitness journey</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialsTab;
