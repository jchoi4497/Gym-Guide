import { useState, useMemo } from "react";
import { Link } from 'react-router-dom';
import { collection, addDoc } from "firebase/firestore";
import db from '../firebase';
import DropDown from "../DropDown";
import ChestWorkout from "../ChestWorkout";
import BackWorkout from "../BackWorkout";
import LegsWorkout from "../LegsWorkout";
import ShouldersWorkout from "../ShouldersWorkout";
import Navbar from "../Navbar";

function HypertophyPage() {
    const [selection, setSelection] = useState(null);
    const [setCountSelection, setSetCountSelection] = useState(null);
    const [inputs, setInputs] = useState({});

    const onInput = (row, exercise, index, input) => {
        const inputData = { ...inputs };
        if (!inputData[row]) {
            const input = new Array(setCountSelection).fill('');
            inputData[row] = {
                input,
                selection: exercise,
            };
        }

        if (index === -1) {
            inputData[row].selection = exercise;
        } else {

            inputData[row].input[index] = input;
        }

        console.log(inputData);
        setInputs(inputData);
    };

    const handleSelect = (option) => {
        setSelection(option);
    };

    const repHandleSelect = (option) => {
        setSetCountSelection(option);
    };

    const handleSaveWorkout = async () => {
        console.log(inputs);
        try {
            const docRef = await addDoc(collection(db, "workoutLogs"), {
                target: selection,
                reps: setCountSelection,
                date: new Date(),
                inputs: inputs
            });

            // Get the document ID
            const workoutId = docRef.id;
            console.log(workoutId);

            // Redirect to another page with the document ID in the URL
            window.location.href = `/SavedWorkout/${workoutId}`;
        } catch (error) {
            console.error('ERROR SAVING WORKOUT:', error);
        }
    };


    const options = [
        { label: "Chest/Triceps", value: "chest" },
        { label: "Back/Biceps", value: "back" },
        { label: "Legs", value: "legs" },
        { label: "Shoulders/Forearms", value: "shoulders" }
    ];

    //reps
    const setCountOptions = [
        { label: "3x15", value: 3 },
        { label: "4x12", value: 4 },
        { label: "5x8", value: 5 }
    ];

    const label = useMemo(() => {
        return setCountOptions.find(option => {
            return option.value === setCountSelection;
        })?.label;
    }, [setCountOptions, setCountSelection]);

    return (
        <div className="bg-gradient-to-br from-sky-200 to-stone-300 min-h-screen pb-32 font-serif">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 pt-14">
                <h1 className="text-5xl font-extrabold mb-4 text-gray-800">Hypertrophy Training</h1>
                <p className="text-lg text-gray-700 italic mb-10">Training program designed to increase muscle size and mass.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white rounded-3xl p-6 shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4">Step 1: Select Muscle Group</h2>
                        <DropDown options={options} value={selection} onChange={handleSelect} />
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4">Step 2: Choose Set × Rep Range</h2>
                        <DropDown options={setCountOptions} value={setCountSelection} onChange={repHandleSelect} />
                    </div>
                </div>

                <div className="mb-14">
                    {selection === "chest" && setCountSelection && <ChestWorkout target={selection} reps={setCountSelection} label={label} inputs={inputs} onInput={onInput} />}
                    {selection === "back" && setCountSelection && <BackWorkout target={selection} reps={setCountSelection} label={label} inputs={inputs} onInput={onInput} />}
                    {selection === "legs" && setCountSelection && <LegsWorkout target={selection} reps={setCountSelection} label={label} inputs={inputs} onInput={onInput} />}
                    {selection === "shoulders" && setCountSelection && <ShouldersWorkout target={selection} reps={setCountSelection} label={label} inputs={inputs} onInput={onInput} />}
                </div>

                <div className="flex flex-col md:flex-row justify-end space-y-4 md:space-y-0 md:space-x-4">
                    <button
                        onClick={handleSaveWorkout}
                        className="px-6 py-3 rounded-full bg-blue-700 text-white font-semibold shadow-lg transition-all duration-300 hover:bg-blue-800 active:scale-95"
                    >
                        Save Workout
                    </button>
                    <Link to="/SavedWorkouts">
                        <button className="bg-sky-500 hover:bg-sky-600 px-6 py-3 rounded-full text-white font-semibold shadow-lg transition-all duration-300 active:scale-95">
                            View Workouts
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HypertophyPage;