import { useState } from "react";
import TableHead from "./TableHead";
import TableRow from "./TableRow";

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
        <div className="flex justify-center font-serif bg-white">

            <table className="border w-full">
                <caption className="text-xl font-bold mb-4 border-t"> {label} - {target} </caption>
                <TableHead reps={reps} />

                <tbody className="border px-4 py-2">
                    {exercises.map(({ id, selected, options }) => (
                        <TableRow
                            key={id}
                            value={selected}
                            options={options}
                            reps={reps}
                            rowId={id}
                            inputs={inputs[id]?.input}
                            onChange={(newOption) => handleExerciseChange(id, newOption)}
                            cellInput={(index, inputValue) => handleInputChange(id, selected, index, inputValue)}
                        />
                    ))}

                </tbody>

            </table>
        </div>);
}

export default ShouldersWorkout;