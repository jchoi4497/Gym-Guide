import { useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import db from '../../../config/firebase';
import { useTheme } from '../../../contexts/ThemeContext';

function AddFriend({ userId }) {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');
  const { theme } = useTheme();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setSearching(true);
    setMessage('');
    setSearchResults([]);

    try {
      // Search for users by email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', searchEmail.trim().toLowerCase())
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        setMessage('No user found with that email');
        return;
      }

      // Filter out current user
      const results = usersSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.id !== userId);

      if (results.length === 0) {
        setMessage('Cannot add yourself as a friend');
        return;
      }

      // Check if already friends or request exists
      const userDoc = await getDoc(doc(db, 'users', userId));
      const friends = userDoc.data()?.friends || [];

      const resultsWithStatus = await Promise.all(
        results.map(async (user) => {
          // Check if already friends
          if (friends.includes(user.id)) {
            return { ...user, status: 'already_friends' };
          }

          // Check for existing pending request (either direction)
          const sentQuery = query(
            collection(db, 'friendRequests'),
            where('fromUserId', '==', userId),
            where('toUserId', '==', user.id),
            where('status', '==', 'pending')
          );
          const receivedQuery = query(
            collection(db, 'friendRequests'),
            where('fromUserId', '==', user.id),
            where('toUserId', '==', userId),
            where('status', '==', 'pending')
          );

          const [sentSnapshot, receivedSnapshot] = await Promise.all([
            getDocs(sentQuery),
            getDocs(receivedQuery),
          ]);

          if (!sentSnapshot.empty) {
            return { ...user, status: 'request_sent' };
          }
          if (!receivedSnapshot.empty) {
            return { ...user, status: 'request_received' };
          }

          return { ...user, status: 'can_add' };
        })
      );

      setSearchResults(resultsWithStatus);
    } catch (error) {
      console.error('Error searching for users:', error);
      setMessage('Error searching for users. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (toUserId) => {
    try {
      // Create friend request
      await addDoc(collection(db, 'friendRequests'), {
        fromUserId: userId,
        toUserId: toUserId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update search results to show request sent
      setSearchResults((prev) =>
        prev.map((user) =>
          user.id === toUserId ? { ...user, status: 'request_sent' } : user
        )
      );

      setMessage('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request. Please try again.');
    }
  };

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          placeholder="Enter email address..."
          className={`flex-1 min-w-0 px-4 py-2 border ${theme.inputBorder} ${theme.inputBg} rounded-lg focus:outline-none ${theme.inputFocus}`}
          disabled={searching}
        />
        <button
          type="submit"
          disabled={searching}
          className={`flex-shrink-0 px-4 sm:px-6 py-2 ${theme.btnPrimary} ${theme.btnPrimaryText} font-semibold rounded-lg transition-colors disabled:bg-gray-400 whitespace-nowrap`}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg mb-4 ${
          message.includes('sent') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {message}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 ${theme.cardBgSecondary} rounded-lg`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                <img
                  src={user.photoURL || '/default-avatar.png'}
                  alt={user.displayName}
                  className={`w-12 h-12 rounded-full border-2 ${theme.cardBorder} flex-shrink-0`}
                />
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className={`font-semibold ${theme.cardText} truncate`}>{user.displayName}</p>
                  <p className={`text-sm ${theme.cardTextSecondary} truncate`}>{user.email}</p>
                </div>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                {user.status === 'can_add' && (
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    className={`w-full sm:w-auto px-4 py-2 ${theme.btnPrimary} ${theme.btnPrimaryText} font-semibold rounded-lg transition-colors whitespace-nowrap`}
                  >
                    Add Friend
                  </button>
                )}
                {user.status === 'already_friends' && (
                  <span className={`text-sm ${theme.cardTextSecondary} italic block text-center sm:text-left`}>Already friends</span>
                )}
                {user.status === 'request_sent' && (
                  <span className={`text-sm ${theme.cardTextSecondary} italic block text-center sm:text-left`}>Request sent</span>
                )}
                {user.status === 'request_received' && (
                  <span className={`text-sm ${theme.cardText} italic block text-center sm:text-left`}>Check requests</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddFriend;
