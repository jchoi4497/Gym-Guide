import { useState } from "react";
import WorkoutTable from "../WorkoutTable";

function ShouldersWorkout({ target, reps, label, inputs, onInput }) {

    const rearDeltExerciseOptions = [
        { label: "Rear Delt Machine", value: "rdm" },
        { label: "1 Arm Rear Delt Machine", value: "oardm" },
        { label: "Cable Rear Delt Flys", value: "crdf" },
        { label: "1 Arm Cable Rear Delt Flys", value: "oacrdf" },
        { label: "Dumbbell Rear Delt Flys", value: "drdf" },
        { label: "Cable Face Pulls", value: "cfp" },
    ];

    const rearDeltTwoExerciseOptions = [
        { label: "1 Arm Cable Rear Delt Flys", value: "oacrdft" },
        { label: "Cable Rear Delt Flys", value: "crdft" },
        { label: "1 Arm Rear Delt Machine", value: "oardmt" },
        { label: "Rear Delt Machine", value: "rdmt" },
        { label: "Dumbbell Rear Delt Flys", value: "drdft" },
        { label: "Cable Face Pulls", value: "cfpt" },
    ];

    const LatRaisesExerciseOptions = [
        { label: "Dumbbell Lat Raises", value: "dlr" },
        { label: "1 Arm Cable Lat Raises", value: "oacdlr" },
        { label: "Machine Lat Raises", value: "mlr" },
    ];

    const LatRaisesTwoExerciseOptions = [
        { label: "1 Arm Cable Lat Raises", value: "oaclrt" },
        { label: "Dumbbell Lat Raises", value: "dlrt" },
        { label: "Machine Lat Raises", value: "mlrt" },
    ];

    const wristCurlOptions = [
        { label: "Cable Wrist Curls w/ Bar", value: "cwc" },
        { label: "Barbell Behind Back Wrist Curls", value: "bbbwc" },
        { label: "Dumbbell Wrist Curls", value: "dbwc" },
    ];

    const reverseWristCurlOptions = [
        { label: "Reverse Dumbbell Wrist Curls", value: "rdbwc" },
        { label: "Forearm Curls w/ Easy Bar", value: "fc" },
    ];

    const [exercises, setExercises] = useState([
        { id: "reardelt", selected: "rdm", options: rearDeltExerciseOptions },
        { id: "latraise", selected: "dlr", options: LatRaisesExerciseOptions },
        { id: "reardelt2", selected: "oacrdft", options: rearDeltTwoExerciseOptions },
        { id: "latraise2", selected: "oaclrt", options: LatRaisesTwoExerciseOptions },
        { id: "wristcurl", selected: "cwc", options: wristCurlOptions },
        { id: "reversewristcurl", selected: "rdbwc", options: reverseWristCurlOptions },
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

export default ShouldersWorkout;