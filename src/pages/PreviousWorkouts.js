import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import db from '../firebase'
// import SurveyResults from '../components/survey/results'; // Import your results component
// import { Link } from 'react-router-dom';

function PreviousWorkouts({workoutId}){
//State hooks for data, loading, and error
    const [workoutData, setWorkoutData] = useState(null)
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

}

export default PreviousWorkouts