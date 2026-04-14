import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import db, { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, orderBy, deleteDoc, doc, where } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { FIREBASE_FIELDS, MUSCLE_GROUP_OPTIONS } from '../config/constants';
import { useTheme } from '../contexts/ThemeContext';

function ListOfWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // modal state
  const [isDeleting, setIsDeleting] = useState(false); // loading state for deletion
  const { theme } = useTheme();

  const handleDeleteWorkout = async (id) => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'workoutLogs', id));
      setWorkouts(workouts.filter((workout) => workout.id !== id));
    } catch (error) {
      console.error('Error deleting workout:', error);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null); // close modal after done
    }
  };

  function getLabel(value) {
    return MUSCLE_GROUP_OPTIONS.find((option) => option.value === value)?.label || value;
  }

  const fetchWorkouts = async (user) => {
    try {
      setIsLoading(true);

      const q = query(
        collection(db, 'workoutLogs'),
        where(FIREBASE_FIELDS.USER_ID, '==', user.uid),
        orderBy(FIREBASE_FIELDS.DATE, 'desc'),
      );

      const querySnapshot = await getDocs(q);
      let workoutArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Secondary sort by createdAt for workouts on the same day
      workoutArray.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date?.seconds * 1000);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date?.seconds * 1000);

        // First compare by date
        const dateDiff = dateB - dateA;
        if (dateDiff !== 0) return dateDiff;

        // If same date, compare by createdAt timestamp
        const createdA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt?.seconds * 1000 || 0);
        const createdB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt?.seconds * 1000 || 0);
        return createdB - createdA;
      });

      setWorkouts(workoutArray);
    } catch (error) {
      setError('Error fetching workouts: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Wait for the user to be ready before fetching
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchWorkouts(user);
      } else {
        setError('Please log in to view your workouts.');
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.pageBg} font-serif ${theme.cardText}`}>
        Loading saved workouts...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme.pageBg} font-serif`}>
        <Navbar />
        <div className="flex items-center justify-center mt-20 text-red-600">{error}</div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className={`min-h-screen ${theme.pageBg} font-serif`}>
        <Navbar />
        <h1 className={`flex justify-center ${theme.headerText}`}>No saved workouts found.</h1>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.pageBg} font-serif pb-32`}>
      <Navbar />
      <div className={`text-5xl mb-6 pl-20 ${theme.headerText}`}>Saved Workouts</div>
      <ul className="space-y-4 px-4 sm:px-20">
        {workouts.map((workout) => {
          const dateFormat = workout.date
            ? new Date(workout.date.seconds * 1000).toLocaleDateString()
            : 'Unknown Date';

          return (
            <li
              key={workout.id}
              className={`${theme.cardBg} p-4 rounded shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl`}
            >
              <div>
                <div className={`text-xl font-semibold ${theme.cardText}`}>
                  {getLabel((workout.muscleGroup || workout.target)?.label ?? (workout.muscleGroup || workout.target))}
                </div>
                <div className={theme.cardTextSecondary}>Date: {dateFormat}</div>
                <button>
                  <Link
                    to={`/SavedWorkout/${workout.id}`}
                    className="text-blue-600 underline mt-2 inline-block"
                  >
                    View Details →
                  </Link>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Link
                  to={`/SavedWorkout/${workout.id}`}
                  className="px-4 py-2 rounded bg-blue-600 text-sky-50 hover:bg-blue-700 text-sm sm:text-base whitespace-nowrap"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setConfirmDeleteId(workout.id)}
                  className="px-4 py-2 rounded bg-red-600 text-sky-50 hover:bg-red-700 text-sm sm:text-base whitespace-nowrap"
                  disabled={isDeleting}
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Custom Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-transparent">
          <div className="bg-sky-50 p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200">
            <h2 className="text-2xl font-bold mb-3 text-gray-800">Confirm Delete</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete this workout? This action can’t be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteWorkout(confirmDeleteId)}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-full text-sm font-medium shadow ${
                  isDeleting
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-sky-50'
                }`}
              >
                {isDeleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListOfWorkouts;
