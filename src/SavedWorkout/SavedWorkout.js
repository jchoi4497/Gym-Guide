import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import db from '../firebase';
import Navbar from '../Navbar';
import { generateSummary } from '../summaryUtil';
import WorkoutInputs from './WorkoutInputs';
import WorkoutNotes from './WorkoutNotes';
import WorkoutAnalysis from './WorkoutAnalysis';

function SavedWorkout() {
    const { workoutId } = useParams();
    const [workoutData, setWorkoutData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedInputs, setEditedInputs] = useState({});
    const [error, setError] = useState(null);
    const [note, setNote] = useState("");
    const [summary, setSummary] = useState('');
    const [previousWorkoutData, setPreviousWorkoutData] = useState(null);

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

    const fetchPreviousWorkout = async (target) => {
        try {
            const q = query(
                collection(db, 'workoutLogs'),
                where('target', '==', target),
                orderBy('date', 'desc'),
                limit(2)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // current workout is latest, previous is index 1
                if (docs.length > 1 && docs[0].id === workoutId) {
                    setPreviousWorkoutData(docs[1]);
                } else {
                    setPreviousWorkoutData(docs[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching previous workout:', error);
        }
    };

    const getLabel = (value) => options.find((option) => option.value === value)?.label || value;

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const docRef = doc(db, 'workoutLogs', workoutId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("Workout document data:", data);
                console.log("Target field:", data.target);
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

    useEffect(() => {
        if (workoutData?.target) {
            fetchPreviousWorkout(workoutData.target);
        }
    }, [workoutData]);

    const handleSaveChanges = async () => {
        try {
            setIsSaving(true);
            console.log("Generating summary with:", JSON.stringify({ inputs: editedInputs, note }));
            const newSummary = await generateSummary(editedInputs, note);
            const docRef = doc(db, 'workoutLogs', workoutId);

            await updateDoc(docRef, {
                inputs: editedInputs,
                note: note,
                summary: newSummary,
            });

            setWorkoutData((prev) => ({
                ...prev,
                inputs: editedInputs,
                note: note,
                summary: newSummary,
            }));

            setSummary(newSummary);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating workout:', error);
            // Optionally show an inline error message here instead of alert
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!workoutData || !workoutData.inputs) return <div>No workout data found.</div>;

    const targetValue = workoutData.target;

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
                        {getLabel(workoutData.target)} Workout
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

            <div className="sm:px-20 px-4">
                {/* Workout Inputs */}
                <WorkoutInputs
                    order={order}
                    isEditing={isEditing}
                    editedInputs={editedInputs}
                    workoutData={workoutData}
                    setEditedInputs={setEditedInputs}
                    previousWorkoutData={previousWorkoutData}
                />

                {/* Workout Notes */}
                <WorkoutNotes
                    value={note}
                    onChange={setNote}
                    isEditing={isEditing}
                />

                {/* OpenAI Analysis */}
                <WorkoutAnalysis summary={summary} />

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
                        disabled={isSaving}
                        className={`px-6 py-3 w-full rounded-3xl shadow-lg text-white transition-all duration-300 ${isSaving
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 active:bg-green-400'
                            } w-auto sm:w-auto self-start active:scale-95`}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default SavedWorkout;
