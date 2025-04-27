import { useState } from "react"
import TableHead from "./TableHead"
import TableRow from "./TableRow"

function LegsWorkout({ target, reps, label, inputs, onInput }){

    const squatOptions = [
        {label: "Barbell Squats", value: "bs"},
        {label: "Smith Machine Squats", value: "sms" },
        {label: "Machine Leg Press", value: "mlp"},
        {label: "Goblet Squats", value: "gs"},
        {label: "Leg Extensions", value: "le"},
    ]


    const splitSquatsOptions = [
        {label: "Dumbbell Bulgarian Split Squats", value: "dbss"},
        {label: "Smith Machine Bulgarian Split Squats", value: "smbss"},
        {label: "Hack Squats", value: "hs" },
        {label: "Leg Curls", value: "lc"},
    ]

    const backExtensionOptions = [
        {label: "Back Extensions", value: "be"},
        {label: "Romanian Deadlift (RDL)", value: "rdl"},
        {label: "Dumbbell RDL", value: "dbrdl" },
        {label: "Deadlift", value: "dl" },
        {label: "Good Mornings", value: "gm" },
    ]

    const calfRaisesOptions = [
        {label: "Calf Raise Machine", value: "crm"},
        {label: "Seated Calf Raises", value: "scr"},
        {label: "Smith Machine Calf Raises", value: "smcr" },
        {label: "Barbell Calf Raises", value: "bcr" },
    ]

    const [exercises, setExercises] = useState([
        {id: "squat", selected: "bs", options: squatOptions},
        {id: "splitsquat", selected: "dbss", options: splitSquatsOptions},
        {id: "backextension", selected: "be", options: backExtensionOptions},
        {id: "calfraise", selected: "crm", options: calfRaisesOptions},
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
 
 export default LegsWorkout