import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import db from './firebase';
import exerciseNames from './exerciseNames';
import Navbar from './Navbar';


function SavedWorkout() {
    const { workoutId } = useParams();
    const [workoutData, setWorkoutData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedInputs, setEditedInputs] = useState({});
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
                setEditedInputs(docSnap.data().inputs);
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

    const handleSaveChanges = async () => {
        try {
            const docRef = doc(db, 'workoutLogs', workoutId);
            await updateDoc(docRef, {
                inputs: editedInputs
            });
            setWorkoutData(prev => ({ ...prev, inputs: editedInputs }));
            setIsEditing(false);
            alert("Workout updated!");
        } catch (error) {
            console.error("Error updating workout:", error);
            alert("Failed to save changes.");
        }
    };

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

    const targetValue = typeof workoutData.target === "string"
        ? workoutData.target
        : workoutData.target?.value;

    const orderedKeys = categoryOrder[targetValue] || [];
    const inputKeys = Object.keys(workoutData.inputs);

    const orderedInputs = orderedKeys.filter(key => inputKeys.includes(key));
    const remainingInputs = inputKeys.filter(key => !orderedKeys.includes(key));

    const order = [...orderedInputs, ...remainingInputs];

    return (
        <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen font-serif pb-80">
            <Navbar />
            <div className="px-4 sm:px-20">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <div className="text-5xl">{getLabel(workoutData.target?.label ?? workoutData.target)} Workout</div>
                    <div className="flex items-center space-x-4">
                        {workoutData.date && (
                            <div className="text-5xl text-gray-600">
                                {new Date(workoutData.date.seconds * 1000).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="sm:px-20 px-4">
                {order.map((key) => {
                    const data = isEditing ? editedInputs[key] : workoutData.inputs[key];
                    if (!data) return null;

                    return (
                        <div key={key} className="mb-8 p-4 bg-white rounded-2xl shadow-lg">
                            <div className="text-2xl font-bold mb-2">
                                {exerciseNames[data.selection] || data.selection}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                                {data.input.map((weight, idx) => (
                                    <div key={idx}>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedInputs[key]?.input[idx] || ""}
                                                onChange={(e) => {
                                                    const newInputs = { ...editedInputs };
                                                    newInputs[key].input[idx] = e.target.value;
                                                    setEditedInputs(newInputs);
                                                }}
                                                className="p-4 rounded bg-gradient-to-r from-blue-50 to-blue-100 text-xl border min-w-[60px] text-center"
                                            />
                                        ) : (
                                            <div className="p-4 rounded bg-gradient-to-r from-blue-50 to-blue-100 text-xl  min-w-[60px] text-center">

                                                {weight || "-"}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>


            <div className="m-6 flex flex-col justify-end sm:space-x-4 space-y-4 px-4 sm:px-20">
                <Link to="/SavedWorkouts">
                    <button className="px-6 py-3 w-full sm:w-auto rounded-3xl shadow-lg text-white bg-gray-800 hover:bg-blue-600 active:bg-gray-600 transition-all duration-300 active:scale-95">
                        View Workouts
                    </button>
                </Link>

                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className=
                    {`px-6 py-3 w-full rounded text-white sm:w-auto self-start active:scale-95 transition-all
                    ${isEditing ? 'bg-red-600 hover:bg-red-700 active:bg-red-400' : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-400'}`}
                >
                    {isEditing ? "Cancel" : "Edit Workout"}
                </button>

                {isEditing && (
                    <button
                        onClick={handleSaveChanges}
                        className="px-6 py-3 w-full rounded-3xl shadow-lg text-white
                                        transition-all duration-300 bg-green-600 hover:filter
                                         hover:bg-green-700 active:bg-green-400 cursor-pointer w-auto sm:w-auto self-start active:scale-95"
                    >
                        Save Changes
                    </button>
                )}
            </div>
        </div>
    );
}

export default SavedWorkout;