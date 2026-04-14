import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../config/firebase';
import db from '../config/firebase';
import Navbar from '../components/Navbar';
import StatsTab from '../components/profile/stats/StatsTab';

function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState('can_add'); // 'can_add', 'request_sent', 'request_received', 'friends'

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!userId || !currentUser) return;

    // If viewing your own profile, redirect to /Profile
    if (userId === currentUser.uid) {
      navigate('/Profile');
      return;
    }

    fetchUserProfile();
  }, [userId, currentUser, navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (!userDoc.exists()) {
        setError('User not found');
        return;
      }

      setProfileUser({ uid: userId, ...userDoc.data() });

      // Check friendship status
      const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const friends = currentUserDoc.data()?.friends || [];

      if (friends.includes(userId)) {
        setIsFriend(true);
        setFriendshipStatus('friends');
      } else {
        setIsFriend(false);

        // Check for pending friend requests
        const sentQuery = query(
          collection(db, 'friendRequests'),
          where('fromUserId', '==', currentUser.uid),
          where('toUserId', '==', userId),
          where('status', '==', 'pending')
        );
        const receivedQuery = query(
          collection(db, 'friendRequests'),
          where('fromUserId', '==', userId),
          where('toUserId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );

        const [sentSnapshot, receivedSnapshot] = await Promise.all([
          getDocs(sentQuery),
          getDocs(receivedQuery),
        ]);

        if (!sentSnapshot.empty) {
          setFriendshipStatus('request_sent');
        } else if (!receivedSnapshot.empty) {
          setFriendshipStatus('request_received');
        } else {
          setFriendshipStatus('can_add');
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await addDoc(collection(db, 'friendRequests'), {
        fromUserId: currentUser.uid,
        toUserId: userId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setFriendshipStatus('request_sent');
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-300 to-stone-300 font-serif">
        <Navbar />
        <div className="flex items-center justify-center mt-20 text-gray-700">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-300 to-stone-300 font-serif">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-20 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{error}</h1>
          <button
            onClick={() => navigate('/Profile')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            Go to My Profile
          </button>
        </div>
      </div>
    );
  }

  if (!profileUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 to-stone-300 font-serif pb-32">
      <Navbar />

      {/* Profile Header */}
      <div className="px-4 sm:px-20">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-8">
          <img
            src={profileUser.photoURL || '/default-avatar.png'}
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
              {profileUser.displayName}
            </h1>
            <p className="text-lg text-gray-600">{profileUser.email}</p>
            <div className="mt-4">
              {friendshipStatus === 'friends' && (
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  👥 Following
                </span>
              )}
              {friendshipStatus === 'can_add' && (
                <button
                  onClick={handleSendFriendRequest}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Add Friend
                </button>
              )}
              {friendshipStatus === 'request_sent' && (
                <span className="inline-block px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
                  Request Sent
                </span>
              )}
              {friendshipStatus === 'request_received' && (
                <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                  Check Requests
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Only - No Tabs */}
        {isFriend ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Workout Stats</h2>
            </div>
            <StatsTab user={profileUser} />
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">
              Add this user as a friend to view their workout stats
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfilePage;
