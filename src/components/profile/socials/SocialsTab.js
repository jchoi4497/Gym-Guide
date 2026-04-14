import { useState } from 'react';
import FriendsList from './FriendsList';
import FriendRequests from './FriendRequests';
import AddFriend from './AddFriend';

function SocialsTab({ user }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'requests'
  const [requestCount, setRequestCount] = useState(0);

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
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === 'add'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Add Friends
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-2 px-4 font-semibold transition-colors relative ${
              activeTab === 'requests'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
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
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">My Friends</h3>
        <FriendsList key={refreshKey} userId={user.uid} />
      </div>

      {/* Coming Soon Features */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Coming Soon</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-800 mb-2">🏆 Leaderboards</h4>
            <p className="text-sm text-gray-600">Compete with friends in challenges</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-800 mb-2">📊 Share Progress</h4>
            <p className="text-sm text-gray-600">Share your fitness journey</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialsTab;
