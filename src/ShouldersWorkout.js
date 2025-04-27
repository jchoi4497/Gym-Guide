import { useState } from "react"
import TableHead from "./TableHead"
import TableRow from "./TableRow"

function ShouldersWorkout({ target, reps, label, inputs, onInput }){

    const rearDeltExerciseOptions = [
        {label: "Rear Delt Machine", value: "rdm"},
        {label: "1 Arm Rear Delt Machine", value: "1ardm" },
        {label: "Cable Rear Delt Flys", value: "crdf"},
        {label: "1 Arm Cable Rear Delt Flys", value: "1arcdf"},
        {label: "Dumbbell Rear Delt Flys", value: "drdf"},
        {label: "Cable Face Pulls", value: "cfp"},
    ]

    const rearDeltTwoExerciseOptions = [
        {label: "1 Arm Cable Rear Delt Flys", value: "1acrdf2"},
        {label: "Cable Rear Delt Flys", value: "crdf2"},
        {label: "1 Arm Rear Delt Machine", value: "1ardm2" },
        {label: "Rear Delt Machine", value: "rdm2"},
        {label: "Dumbbell Rear Delt Flys", value: "drdf2"},
        {label: "Cable Face Pulls", value: "cfp2"},
    ]

    const LatRaisesExerciseOptions = [
        {label: "Dumbbell Lat Raises", value: "dlr"},
        {label: "1 Arm Cable Lat Raises", value: "1acdlr" },
        {label: "Machine Lat Raises", value: "mlr"},
    ]

    const LatRaisesTwoExerciseOptions = [
        {label: "1 Arm Cable Lat Raises", value: "1aclr2" },
        {label: "Dumbbell Lat Raises", value: "dlr2"},
        {label: "Machine Lat Raises", value: "mlr2"},
    ]

    const wristCurlOptions = [
        {label: "Cable Wrist Curls w/ Bar", value: "cwc"},
        {label: "Barbell Behind Back Wrist Curls", value: "bbbwc"},
        {label: "Dumbbell Wrist Curls", value: "dbwc" },
    ]

    const reverseWristCurlOptions = [
        {label: "Reverse Dumbbell Wrist Curls", value: "rdbwc" },
        {label: "Forearm Curls w/ Easy Bar", value: "fc" },
    ]

    const [exercises, setExercises] = useState([
        {id: "reardelt", selected: "rdm", options: rearDeltExerciseOptions},
        {id: "latraise", selected: "dlr", options: LatRaisesExerciseOptions},
        {id: "reardelt2", selected: "1acrdf2", options: rearDeltTwoExerciseOptions},
        {id: "latraise2", selected: "1aclr2", options: LatRaisesTwoExerciseOptions},
        {id: "wristcurl", selected: "cwc", options: wristCurlOptions},
        {id: "reversewristcurl", selected: "rdbwc", options: reverseWristCurlOptions},
    ])

    const handleExerciseChange = (rowId, newExerciseValue) => {
        const exerciseOptions = exercises.map((exercise) => 
            exercise.id === rowId
                ? { ...exercise, selected: newExerciseValue }
                : exercise)
            
        setExercises(exerciseOptions)
        onInput(rowId, newExerciseValue, -1 )

    }

    const handleInputChange = (rowId, selected, index, inputValue ) => {
        onInput(rowId, selected, index, inputValue)
    }

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
    </div>)
 }
 
 export default ShouldersWorkout