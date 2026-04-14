import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import db from '../../../config/firebase';

function FriendsList({ userId }) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchFriends();
  }, [userId]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      // Get user's friends array
      const userDoc = await getDoc(doc(db, 'users', userId));
      const friendIds = userDoc.data()?.friends || [];

      if (friendIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // Fetch friend details
      const friendsData = await Promise.all(
        friendIds.map(async (friendId) => {
          const friendDoc = await getDoc(doc(db, 'users', friendId));
          if (friendDoc.exists()) {
            return { id: friendId, ...friendDoc.data() };
          }
          return null;
        })
      );

      setFriends(friendsData.filter(f => f !== null));
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = async (friendId) => {
    if (!confirm('Are you sure you want to unfriend this user?')) {
      return;
    }

    try {
      // Remove from both users' friends arrays
      await updateDoc(doc(db, 'users', userId), {
        friends: arrayRemove(friendId),
      });
      await updateDoc(doc(db, 'users', friendId), {
        friends: arrayRemove(userId),
      });

      // Refresh friends list
      await fetchFriends();
    } catch (error) {
      console.error('Error unfriending user:', error);
      alert('Failed to unfriend user. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-600">
        Loading friends...
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">No friends yet</p>
        <p className="text-sm mt-2">Send friend requests to connect with others!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={friend.photoURL || '/default-avatar.png'}
              alt={friend.displayName}
              className="w-12 h-12 rounded-full border-2 border-gray-200 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{friend.displayName}</p>
              <p className="text-sm text-gray-600 truncate">{friend.email}</p>
            </div>
          </div>
          <div className="flex gap-2 sm:flex-shrink-0">
            <button
              onClick={() => navigate(`/user/${friend.id}`)}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              View Profile
            </button>
            <button
              onClick={() => handleUnfriend(friend.id)}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            >
              Unfriend
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FriendsList;
