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
    const [note, setNote] = useState("");

    // AI summary states
    const [summary, setSummary] = useState('');

    const categoryOrder = {
        chest: ['incline', 'chestpress', 'fly', 'tri', 'tri2'],
        back: ['pullup', 'row', 'lat', 'bicep', 'bicep2'],
        legs: ['squat', 'splitsquat', 'backextension', 'calfraise'],
        shoulders: ['reardelt', 'latraise', 'reardelt2', 'latraise2', 'wristcurl', 'reversewristcurl'],
    };

    const options = [
        { label: 'Chest/Triceps', value: 'chest' },
        { label: 'Back/Biceps', value: 'back' },
        { label: 'Legs', value: 'legs' },
        { label: 'Shoulders/Forearms', value: 'shoulders' },
    ];

    const getLabel = (value) => options.find((option) => option.value === value)?.label || value;

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const docRef = doc(db, 'workoutLogs', workoutId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setWorkoutData(data);
                setEditedInputs(data.inputs);
                setNote(data.note || "");
                setSummary(data.summary || '');
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
    }, [workoutId]);

    const buildExerciseSummaryText = (inputs) => {
        return Object.entries(inputs)
            .map(([key, data]) => {
                const exerciseName = exerciseNames[data.selection] || data.selection;
                const sets = data.input.filter(set => set.trim() !== "").join(", ");
                return `${exerciseName}: ${sets || "no data"}`;
            })
            .join("; ");
    };

    const generateSummary = async (inputs, note) => {

        try {
            const summaryText = buildExerciseSummaryText(inputs);
            const promptText = `
                The following is a workout log entry.

                    **User Notes:** "${note}"

                    **Workout Data Summary:** ${summaryText}

                    Based on the workout data and the user’s notes about how they were feeling that day, provide a brief analysis of the session.

                    - Highlight what went well and what could be improved based on the exercise performance.
                    - Reflect on how their reported mood or condition may have affected the workout.
                    - Offer one or two actionable suggestions for their next session.
                    - Conclude with a motivational sentence to keep them encouraged.

                    Summarize everything in 2–3 varied, conversational sentences.
                    For newer saved workouts, slightly change the phrasing style to keep things fresh,
                    but for previously analyzed workouts, keep their original summary consistent.`;

            // how user was feeling, how they felt the training went,
            const response = await fetch("/.netlify/functions/createSummary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: promptText,
                }),
            });

            const data = await response.json();
            return data.message;
        } catch (error) {
            console.error("OpenAI Error:", error);
        } finally {
            return '';
        }
    };

    const handleSaveChanges = async () => {
        try {
            const docRef = doc(db, 'workoutLogs', workoutId);
            await updateDoc(docRef, { inputs: editedInputs, note: note });
            setWorkoutData((prev) => ({ ...prev, inputs: editedInputs, note: note }));
            setIsEditing(false);
            alert('Workout updated!');
        } catch (error) {
            console.error('Error updating workout:', error);
            alert('Failed to save changes.');
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!workoutData || !workoutData.inputs) return <div>No workout data found.</div>;

    const targetValue = typeof workoutData.target === 'string' ? workoutData.target : workoutData.target?.value;

    const orderedKeys = categoryOrder[targetValue] || [];
    const inputKeys = Object.keys(workoutData.inputs);
    const orderedInputs = orderedKeys.filter((key) => inputKeys.includes(key));
    const remainingInputs = inputKeys.filter((key) => !orderedKeys.includes(key));
    const order = [...orderedInputs, ...remainingInputs];

    return (
        <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen font-serif pb-80">
            <Navbar />
            <div className="px-4 sm:px-20">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <div className="text-5xl">
                        {getLabel(workoutData.target?.label ?? workoutData.target)} Workout
                    </div>
                    <div className="flex items-center space-x-4">
                        {workoutData.date && (
                            <div className="text-5xl text-gray-600">
                                {new Date(workoutData.date.seconds * 1000).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto sm:px-20 px-4">
                {/* Workout Inputs */}

                <div className="mb-8">
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
                                                    value={editedInputs[key]?.input[idx] || ''}
                                                    onChange={(e) => {
                                                        const newInputs = { ...editedInputs };
                                                        newInputs[key].input[idx] = e.target.value;
                                                        setEditedInputs(newInputs);
                                                    }}
                                                    className="p-4 rounded bg-gradient-to-r from-blue-50 to-blue-100 text-xl border min-w-[60px] text-center"
                                                />
                                            ) : (
                                                <div className="p-4 rounded bg-gradient-to-r from-blue-50 to-blue-100 text-xl min-w-[60px] text-center">
                                                    {weight || '-'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Workout Notes */}

                <div className="mb-8 p-4 bg-white rounded-2xl shadow-lg">
                    <div className="text-2xl font-bold mb-2">Workout Notes</div>
                    {isEditing ? (
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            className="w-full p-4 rounded border border-gray-300 text-lg resize-none"
                            placeholder="Write your notes about how you felt, sleep, mood, etc."
                        />
                    ) : (
                        <p className="italic text-lg whitespace-pre-wrap">{note || 'No notes added.'}</p>
                    )}
                </div>

                {/* OpenAI Analysis */}

                <div className="mb-20 p-4 bg-white rounded-2xl shadow-lg">
                    <h2 className="text-3xl font-bold mb-4">Analysis</h2>
                    <p className="italic text-lg">{summary}</p>
                </div>

            </div>

            <div className="m-6 flex flex-col justify-end sm:space-x-4 space-y-4 px-4 sm:px-20">
                <Link to="/SavedWorkouts">
                    <button className="px-6 py-3 w-full sm:w-auto rounded-3xl shadow-lg text-white bg-gray-800 hover:bg-blue-600 active:bg-gray-600 transition-all duration-300 active:scale-95">
                        View Workouts
                    </button>
                </Link>

                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-6 py-3 w-full rounded text-white sm:w-auto self-start active:scale-95 transition-all ${isEditing
                        ? 'bg-red-600 hover:bg-red-700 active:bg-red-400'
                        : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-400'
                        }`}
                >
                    {isEditing ? 'Cancel' : 'Edit Workout'}
                </button>

                {isEditing && (
                    <button
                        onClick={handleSaveChanges}
                        className="px-6 py-3 w-full rounded-3xl shadow-lg text-white transition-all duration-300 bg-green-600 hover:bg-green-700 active:bg-green-400 cursor-pointer w-auto sm:w-auto self-start active:scale-95"
                    >
                        Save Changes
                    </button>
                )}
            </div>
        </div>
    );
}

export default SavedWorkout;
