import { useState } from "react";
import WorkoutTable from "../WorkoutTable";

function LegsWorkout({ target, reps, label, inputs, onInput }) {

    const squatOptions = [
        { label: "Barbell Squats", value: "bs" },
        { label: "Smith Machine Squats", value: "sms" },
        { label: "Machine Leg Press", value: "mlp" },
        { label: "Goblet Squats", value: "gs" },
        { label: "Leg Extensions", value: "le" },
    ];


    const splitSquatsOptions = [
        { label: "Dumbbell Bulgarian Split Squats", value: "dbss" },
        { label: "Smith Machine Bulgarian Split Squats", value: "smbss" },
        { label: "Hack Squats", value: "hs" },
        { label: "Leg Curls", value: "lc" },
    ];

    const backExtensionOptions = [
        { label: "Back Extensions", value: "be" },
        { label: "Romanian Deadlift (RDL)", value: "rdl" },
        { label: "Dumbbell RDL", value: "dbrdl" },
        { label: "Deadlift", value: "dl" },
        { label: "Good Mornings", value: "gm" },
    ];

    const calfRaisesOptions = [
        { label: "Calf Raise Machine", value: "crm" },
        { label: "Seated Calf Raises", value: "scr" },
        { label: "Smith Machine Calf Raises", value: "smcr" },
        { label: "Barbell Calf Raises", value: "bcr" },
    ];

    const [exercises, setExercises] = useState([
        { id: "squat", selected: "bs", options: squatOptions },
        { id: "splitsquat", selected: "dbss", options: splitSquatsOptions },
        { id: "backextension", selected: "be", options: backExtensionOptions },
        { id: "calfraise", selected: "crm", options: calfRaisesOptions },
    ]);

    const handleExerciseChange = (rowId, newExerciseValue) => {
        const exerciseOptions = exercises.map((exercise) =>
            exercise.id === rowId
                ? { ...exercise, selected: newExerciseValue }
                : exercise);

        setExercises(exerciseOptions);
        onInput(rowId, newExerciseValue, -1);

    };

    const handleInputChange = (rowId, selected, index, inputValue) => {
        onInput(rowId, selected, index, inputValue);
    };


    return (
        <WorkoutTable
            label={label}
            target={target}
            reps={reps}
            exercises={exercises}
            onExerciseChange={handleExerciseChange}
            onCellInput={handleInputChange}
            inputs={inputs}
        />
    );
}

export default LegsWorkout;