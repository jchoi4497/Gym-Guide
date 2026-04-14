import { useState } from 'react';
import FriendsList from './FriendsList';
import FriendRequests from './FriendRequests';
import AddFriend from './AddFriend';

function SocialsTab({ user }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRequestHandled = () => {
    // Trigger refresh of friends list when request is accepted
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Add Friend */}
      <AddFriend userId={user.uid} />

      {/* Friend Requests */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Friend Requests</h3>
        <FriendRequests userId={user.uid} onRequestHandled={handleRequestHandled} />
      </div>

      {/* Friends List */}
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
