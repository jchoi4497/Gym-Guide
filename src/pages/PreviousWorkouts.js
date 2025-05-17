import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import db from '../firebase';
// import SurveyResults from '../components/survey/results'; // Import your results component
// import { Link } from 'react-router-dom';

function PreviousWorkouts() {
    //State hooks for data, loading, and error
    const { workoutId } = useParams();
    const [workoutData, setWorkoutData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    //Fetch Data from Firestore
    const fetchData = async () => {
        try {
            const docRef = doc(db, "workoutLogs", workoutId); // Reference to the 'poll' collection
            const docSnap = await getDoc(docRef); // Get the document snapshot

            if (docSnap.exists()) {
                setWorkoutData(docSnap.data()); // Set the data to state
            } else {
                setError('No such document found.'); // Handle missing document
            }
        } catch (error) {
            setError('Error fetching data: ' + error.message); // Handle errors during fetch
        } finally {
            setIsLoading(false); // Set loading to false after data is fetched
        }
    };

    // useEffect to trigger fetchData whenever pollId changes
    useEffect(() => {
        if (workoutId) {
            fetchData(); // Fetch data if pollId is provided
        }
    }, [workoutId]); // Dependency array to trigger on pollId change

    if (isLoading) {
        return <div>Loading Workout...</div>;
    }
    if (error) {
        return <div>{error}</div>;
    }
    if (!workoutData) {
        return <div>No workout data found.</div>;
    }

    const dateFormat = workoutData.timestamp
        ? new Date(workoutData.timestamp.seconds * 1000).toLocaleDateString()
        : 'Unkown Date';

    console.log(workoutData.target);
    return (
        <div className="p-4 bg-white shadow rounded mb-4">
            <div className="text-xl font-bold">Workout Details</div>
            <div className="mt-2">
                <strong>Target Muscle Group:</strong> {workoutData.target?.label}
            </div>
            <div>
                <strong>Date:</strong> {dateFormat}
            </div>
            <div className="mt-4">
                <strong>Exercises:</strong>
                {workoutData.inputs && workoutData.inputs.length > 0 ? (
                    <ul className="mt-4">
                        {Object.entries(workoutData.inputs).map(([row, exerciseData], index) => (
                            <li key={index} className="mb-4">
                                <div className="font-semibold">{exerciseData.selection}</div>
                                <div className="ml-4">
                                    {exerciseData.input.map((value, setIdx) => (
                                        <div key={setIdx}>Set {setIdx + 1}: {value}</div>
                                    ))}
                                </div>


                            </li>
                        ))}
                    </ul>
                ) : (
                    <div>No exercises found for this workout.</div>
                )}
            </div>

        </div>

    );

}

export default PreviousWorkouts;