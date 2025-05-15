import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import db from './firebase'; // Assuming your Firestore instance is in a separate file
import exerciseNames from './exerciseNames';


function SavedWorkout({ label, target }) {
    const { workoutId } = useParams();
    const [workoutData, setWorkoutData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const categoryOrder = {
        chest: ["incline", "chestpress", "fly", "tri", "tri2"],
        back: ["pullup", "row", "lat", "bicep", "bicep2"],
        legs: ["squat", "splitsquat", "backextension", "calfraise"],
        shoulders: ["reardelt", "latraise", "reardelt2", "latraise2", "wristcurl", "reversewristcurl"]
    };

    const fetchData = async () => {
        try {
            const docRef = doc(db, 'workoutLogs', workoutId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("DOC SNAP DATA:", docSnap.data());
                setWorkoutData(docSnap.data());
            } else {
                setError('No such document found.');
            }
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [workoutId]); // Only re-fetch data when docId changes

    // SavedWorkouts States
    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }
    if (!workoutData || !workoutData.inputs) {
        return <div>No workout data found.</div>;
    }

    const order = categoryOrder[workoutData.target] || Object.keys(workoutData.inputs);

    return (
        <div className="bg-sky-100 min-h-screen pt-10 font-serif pb-80 px-20">
            <div className="text-5xl mb-6">Saved Hypertrophy Workout</div>

            {order.map((key) => {
                const data = workoutData.inputs[key];
                if (!data) return null;

                return (
                    <div key={key} className="mb-8 p-4 bg-white rounded-2xl shadow-lg">
                        <div className="text-2xl font-bold mb-2">
                            {exerciseNames[data.selection] || data.selection}
                        </div>
                        <div className="flex space-x-4">
                            {data.input.map((weight, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded bg-blue-200 text-xl text-center min-w-[60px]"
                                >
                                    {weight || "-"}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default SavedWorkout;