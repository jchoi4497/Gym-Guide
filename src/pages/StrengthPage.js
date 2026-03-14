import { useState, useMemo } from "react";
import DropDown from "../DropDown";
import ChestWorkout from "../WorkoutSplits/ChestWorkout";
import BackWorkout from "../WorkoutSplits/BackWorkout";
import LegsWorkout from "../WorkoutSplits/LegsWorkout";
import ShouldersWorkout from "../WorkoutSplits/ShouldersWorkout";
import db from '../firebase';
import { collection, addDoc } from "firebase/firestore";


function StrengthPage() {
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
    const [numberOfSets, setNumberOfSets] = useState(null);
    const [exerciseData, setExerciseData] = useState({});

    const handleExerciseDataChange = (categoryKey, exerciseName, setIndex, setInput) => {
        const updatedExerciseData = { ...exerciseData };
        if (!updatedExerciseData[categoryKey]) {
            const setsArray = new Array(numberOfSets).fill('');
            updatedExerciseData[categoryKey] = {
                input: setsArray,
                selection: exerciseName,
            };
        }

        if (setIndex === -1) {
            updatedExerciseData[categoryKey].selection = exerciseName;
        } else {
            updatedExerciseData[categoryKey].input[setIndex] = setInput;
        }

        console.log(updatedExerciseData);
        setExerciseData(updatedExerciseData);
    };

    const handleMuscleGroupSelect = (option) => {
        setSelectedMuscleGroup(option);
    };

    const handleSetCountSelect = (option) => {
        setNumberOfSets(option);
    };

    const handleSaveWorkout = async () => {
        const workoutDoc = await addDoc(collection(db, "workoutLogs"), {
            // target: selectedMuscleGroup,
            // reps: numberOfSets,
            // timestamp: new Date(),
            inputs: exerciseData
        });
    };

    const options = [
        { label: "Chest/Triceps", value: "chest" },
        { label: "Back/Biceps", value: "back" },
        { label: "Legs", value: "legs" },
        { label: "Shoulders/Forearms", value: "shoulders" }
    ];

    const setOptions = [
        { label: "3x6", value: "3" },
        { label: "4x8", value: "4" },
        { label: "5x5", value: "5" }
    ];

    const setRangeLabel = useMemo(() => {
        return setOptions.find(option => {
            return option.value === numberOfSets;
        })?.label;
    }, [numberOfSets]);

    return <div className="bg-sky-100 min-h-screen pt-10 font-serif pb-80 px-20">
        <div className="text-6xl mb-6 ml-10">Strength Training</div>
        <div className="mb-6 italic ml-10">Training program designed to build muscle strength and mass</div>

        <div className="flex m-10 space-x-12">
            <div className="">STEP 1. Select Muscle Group to Target.
                <DropDown className="" options={options} value={selectedMuscleGroup} onChange={handleMuscleGroupSelect} />
            </div>
            <div className="">STEP 2. Select Set x Rep Range
                <DropDown className="" options={setOptions} value={numberOfSets} onChange={handleSetCountSelect} />
            </div>
        </div>
        {selectedMuscleGroup === "chest" && numberOfSets && <ChestWorkout muscleGroup={selectedMuscleGroup} numberOfSets={numberOfSets} setRangeLabel={setRangeLabel} exerciseData={exerciseData} onExerciseDataChange={handleExerciseDataChange} />}
        {selectedMuscleGroup === "back" && numberOfSets && <BackWorkout muscleGroup={selectedMuscleGroup} numberOfSets={numberOfSets} setRangeLabel={setRangeLabel} exerciseData={exerciseData} onExerciseDataChange={handleExerciseDataChange} />}
        {selectedMuscleGroup === "legs" && numberOfSets && <LegsWorkout muscleGroup={selectedMuscleGroup} numberOfSets={numberOfSets} setRangeLabel={setRangeLabel} exerciseData={exerciseData} onExerciseDataChange={handleExerciseDataChange} />}
        {selectedMuscleGroup === "shoulders" && numberOfSets && <ShouldersWorkout muscleGroup={selectedMuscleGroup} numberOfSets={numberOfSets} setRangeLabel={setRangeLabel} exerciseData={exerciseData} onExerciseDataChange={handleExerciseDataChange} />}

        <div className="m-6 flex justify-end">
            <button className="px-5 py-2 rounded-3xl shadow-lg text-white
                                    transition-all duration-300 bg-blue-700 hover:filter
                                    hover:bg-blue-800 active:bg-blue-400 cursor-pointer"
                onClick={handleSaveWorkout}
            >
                Save Plan
            </button>
        </div>

    </div>;
}

export default StrengthPage;