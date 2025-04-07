import { useState } from "react"
import TableHead from "./TableHead"
import TableRow from "./TableRow"

function LegsWorkout({ target, reps }){
// Squats
    const [squatExercise, setSquatExercise] = useState(null)

    const handleSelectSquatExercise = (option) => {
        setSquatExercise(option)
    }

    const squatOptions = [
        {label: "Barbell Squats", value: "bs"},
        {label: "Smith Machine Squats", value: "sms" },
        {label: "Machine Leg Press", value: "mlp"},
        {label: "Goblet Squats", value: "gs"},
        {label: "Leg Extensions", value: "le"},
    ]

// Split Squats
const [splitSquatsExercise, setSplitSquatsExercise] = useState(null)

const handleSelectSplitSquatsExercise = (option) => {
    setSplitSquatsExercise(option)
}

const splitSquatsOptions = [
    {label: "Dumbbell Bulgarian Split Squats", value: "dbss"},
    {label: "Smith Machine Bulgarian Split Squats", value: "smbss"},
    {label: "Hack Squats", value: "hs" },
    {label: "Leg Curls", value: "lc"},
]

// back Extensions
const [backExtensionExercise, setBackExtensionExercise] = useState(null)

const handleSelectBackExtensionExercise = (option) => {
    setBackExtensionExercise(option)
}

const backExtensionOptions = [
    {label: "Back Extensions", value: "be"},
    {label: "Romanian Deadlift (RDL)", value: "rdl"},
    {label: "Dumbbell RDL", value: "dbrdl" },
    {label: "Deadlift", value: "dl" },
    {label: "Good Mornings", value: "gm" },
]

// calf raises
const [calfRaisesExercise, setCalfRaisesExercise] = useState(null)

const handleSelectCalfRaisesExercise = (option) => {
    setCalfRaisesExercise(option)
}

const calfRaisesOptions = [
    {label: "Calf Raise Machine", value: "crm"},
    {label: "Seated Calf Raises", value: "scr"},
    {label: "Smith Machine Calf Raises", value: "smcr" },
    {label: "Barbell Calf Raises", value: "bcr" },
]

    return (
     <div className="flex justify-center font-serif bg-white">
         <table className="border w-full">
            <caption className="text-xl font-bold mb-4 border-t"> {target?.label} - {reps?.label} </caption>
            <TableHead target={target} reps={reps} muscle="legs" />
            
            <tbody className="border px-4 py-2">
                <TableRow
                onChange={handleSelectSquatExercise}
                value={squatExercise}
                options={squatOptions}
                target={target}
                reps={reps}
                muscle="legs"/>
                <TableRow 
                onChange={handleSelectSplitSquatsExercise}
                value={splitSquatsExercise}
                options={splitSquatsOptions}
                target={target}
                reps={reps}
                muscle="legs"/>
                <TableRow
                onChange={handleSelectBackExtensionExercise}
                value={backExtensionExercise}
                options={backExtensionOptions}
                target={target}
                reps={reps}
                muscle="legs"/>
                <TableRow
                onChange={handleSelectCalfRaisesExercise}
                value={calfRaisesExercise}
                options={calfRaisesOptions}
                target={target}
                reps={reps}
                muscle="legs"/>
            </tbody>
         </table>
     </div>)
 }
 
 export default LegsWorkout