import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, serverTimestamp, getDoc } from 'firebase/firestore';
import db from '../../../config/firebase';

function FriendRequests({ userId, onRequestHandled }) {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'

  useEffect(() => {
    if (!userId) return;
    fetchRequests();
  }, [userId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      // Fetch received requests
      const receivedQuery = query(
        collection(db, 'friendRequests'),
        where('toUserId', '==', userId),
        where('status', '==', 'pending')
      );
      const receivedSnapshot = await getDocs(receivedQuery);

      const receivedData = await Promise.all(
        receivedSnapshot.docs.map(async (docSnapshot) => {
          const requestData = docSnapshot.data();
          // Fetch sender's info
          const senderDoc = await getDoc(doc(db, 'users', requestData.fromUserId));
          return {
            id: docSnapshot.id,
            ...requestData,
            sender: senderDoc.exists() ? senderDoc.data() : null,
          };
        })
      );

      // Fetch sent requests
      const sentQuery = query(
        collection(db, 'friendRequests'),
        where('fromUserId', '==', userId),
        where('status', '==', 'pending')
      );
      const sentSnapshot = await getDocs(sentQuery);

      const sentData = await Promise.all(
        sentSnapshot.docs.map(async (docSnapshot) => {
          const requestData = docSnapshot.data();
          // Fetch receiver's info
          const receiverDoc = await getDoc(doc(db, 'users', requestData.toUserId));
          return {
            id: docSnapshot.id,
            ...requestData,
            receiver: receiverDoc.exists() ? receiverDoc.data() : null,
          };
        })
      );

      setReceivedRequests(receivedData);
      setSentRequests(sentData);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId, fromUserId) => {
    try {
      // Update request status
      await updateDoc(doc(db, 'friendRequests', requestId), {
        status: 'accepted',
        updatedAt: serverTimestamp(),
      });

      // Add to both users' friends arrays
      await updateDoc(doc(db, 'users', userId), {
        friends: arrayUnion(fromUserId),
      });
      await updateDoc(doc(db, 'users', fromUserId), {
        friends: arrayUnion(userId),
      });

      // Refresh requests
      await fetchRequests();

      // Notify parent to refresh friends list
      if (onRequestHandled) onRequestHandled();

      console.log('Friend request accepted!');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Failed to accept friend request. Please try again.');
    }
  };

  const handleDecline = async (requestId) => {
    try {
      // Update request status
      await updateDoc(doc(db, 'friendRequests', requestId), {
        status: 'declined',
        updatedAt: serverTimestamp(),
      });

      // Refresh requests
      await fetchRequests();

      console.log('Friend request declined');
    } catch (error) {
      console.error('Error declining friend request:', error);
      alert('Failed to decline friend request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-600">
        Loading requests...
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-2 px-4 font-semibold transition-colors ${
            activeTab === 'received'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Received ({receivedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-2 px-4 font-semibold transition-colors ${
            activeTab === 'sent'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Sent ({sentRequests.length})
        </button>
      </div>

      {/* Received Requests */}
      {activeTab === 'received' && (
        <div className="space-y-3">
          {receivedRequests.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No pending requests</p>
          ) : (
            receivedRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                {request.sender && (
                  <>
                    <img
                      src={request.sender.photoURL || '/default-avatar.png'}
                      alt={request.sender.displayName}
                      className="w-12 h-12 rounded-full border-2 border-white"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {request.sender.displayName}
                      </p>
                      <p className="text-sm text-gray-600">{request.sender.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request.id, request.fromUserId)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(request.id)}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Sent Requests */}
      {activeTab === 'sent' && (
        <div className="space-y-3">
          {sentRequests.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No sent requests</p>
          ) : (
            sentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                {request.receiver && (
                  <>
                    <img
                      src={request.receiver.photoURL || '/default-avatar.png'}
                      alt={request.receiver.displayName}
                      className="w-12 h-12 rounded-full border-2 border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {request.receiver.displayName}
                      </p>
                      <p className="text-sm text-gray-600">{request.receiver.email}</p>
                    </div>
                    <span className="text-sm text-gray-500 italic">Pending...</span>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default FriendRequests;
