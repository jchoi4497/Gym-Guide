import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import db from './firebase';
import Navbar from './Navbar';

function ListOfWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // modal state
  const [isDeleting, setIsDeleting] = useState(false); // loading state for deletion

  const options = [
    { label: "Chest/Triceps", value: "chest" },
    { label: "Back/Biceps", value: "back" },
    { label: "Legs", value: "legs" },
    { label: "Shoulders/Forearms", value: "shoulders" }
  ];

  const handleDeleteWorkout = async (id) => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "workoutLogs", id));
      setWorkouts(workouts.filter(workout => workout.id !== id));
    } catch (error) {
      console.error("Error deleting workout:", error);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null); // close modal after done
    }
  };

  function getLabel(value) {
    return options.find(option => option.value === value)?.label || value;
  }

  const fetchWorkouts = async () => {
    try {
      const q = query(collection(db, "workoutLogs"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const workoutArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkouts(workoutArray);
    } catch (error) {
      setError('Error fetching workouts: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-300 to-stone-300 font-serif text-gray-800">
        Loading saved workouts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-300 to-stone-300 font-serif text-red-600">
        {error}
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-300 to-stone-300 font-serif text-gray-800">
        No saved workouts found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 to-stone-300 font-serif pb-32">
      <Navbar />
      <div className="text-5xl mb-6 pl-20">Saved Workouts</div>
      <ul className="space-y-4 px-4 sm:px-20">
        {workouts.map(workout => {
          const dateFormat = workout.date
            ? new Date(workout.date.seconds * 1000).toLocaleDateString()
            : 'Unknown Date';

          return (
            <li
              key={workout.id}
              className="bg-sky-50 p-4 rounded shadow-lg flex items-center justify-between sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl"
            >
              <div>
                <div className="text-xl font-semibold">{getLabel(workout.target?.label ?? workout.target)}</div>
                <div className="text-gray-600">Date: {dateFormat}</div>
                <button>
                  <Link
                    to={`/SavedWorkout/${workout.id}`}
                    className="text-blue-600 underline mt-2 inline-block"
                  >
                    View Details →
                  </Link>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  to={`/SavedWorkout/${workout.id}`}
                  className="px-3 py-1 rounded bg-blue-600 text-sky-50 hover:bg-blue-700"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setConfirmDeleteId(workout.id)}
                  className="ml-4 px-3 py-1 rounded bg-red-600 text-sky-50 hover:bg-red-700"
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
                className={`px-4 py-2 rounded-full text-sm font-medium shadow ${isDeleting
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