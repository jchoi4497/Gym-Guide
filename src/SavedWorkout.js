import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import db from './firebase'; // Assuming your Firestore instance is in a separate file
import exerciseNames from './exerciseNames';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';


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
    const options = [
        { label: "Chest/Triceps", value: "chest" },
        { label: "Back/Biceps", value: "back" },
        { label: "Legs", value: "legs" },
        { label: "Shoulders/Forearms", value: "shoulders" }
    ];

    function getLabel(value) {
        return options.find(option => option.value === value)?.label || value;
    }

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

    const order = categoryOrder[workoutData.target?.value] || Object.keys(workoutData.inputs);

    return (
        <div className="bg-sky-100 min-h-screen pt-10 font-serif pb-80 px-20">
            <Navbar />
            <div className="flex justify-between items-center mb-6">
                <div className="text-5xl">{getLabel(workoutData.target?.label ?? workoutData.target)} Workout</div>
                {workoutData.date && (
                    <div className="text-5xl text-gray-600">
                        {new Date(workoutData.date.seconds * 1000).toLocaleDateString()}
                    </div>
                )}
            </div>


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
            <div className="m-6 flex justify-end">
                <Link to="/SavedWorkouts">
                    <button className="px-5 py-2 rounded-3xl shadow-lg text-white
                                    transition-all duration-300 bg-blue-700 hover:filter
                                     hover:bg-blue-800 active:bg-blue-400 cursor-pointer">
                        View Workouts
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default SavedWorkout;