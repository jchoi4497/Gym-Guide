import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import db from './firebase';
import { Link } from 'react-router-dom';

function ListOfWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const options = [
    { label: "Chest/Triceps", value: "chest" },
    { label: "Back/Biceps", value: "back" },
    { label: "Legs", value: "legs" },
    { label: "Shoulders/Forearms", value: "shoulders" }
  ];

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workout?")) return;
    try {
      await deleteDoc(doc(db, "workoutLogs", id));
      setWorkouts(workouts.filter(workout => workout.id !== id));
    } catch (error) {
      console.error("Error deleting workout:", error);
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
    return <div>Loading previous workouts...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (workouts.length === 0) {
    return <div>No previous workouts found.</div>;
  }

  return (
    <div className="p-6 bg-sky-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Previous Workouts</h1>
      <ul className="space-y-4">
        {workouts.map(workout => {
          const dateFormat = workout.date
            ? new Date(workout.date.seconds * 1000).toLocaleDateString()
            : 'Unknown Date';

          return (
            <li key={workout.id} className="bg-white p-4 rounded shadow  flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold">{getLabel(workout.target?.label ?? workout.target)}</div>
                <div className="text-gray-600">Date: {dateFormat}</div>
                <button>
                  <Link
                    to={`/PreviousWorkouts/${workout.id}`}
                    className="text-blue-600 underline mt-2 inline-block"
                  >
                    View Details →
                  </Link>
                </button>
              </div>

              <button
                onClick={() => handleDeleteWorkout(workout.id)}
                className="ml-4 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>

            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ListOfWorkouts;
