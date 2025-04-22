import { useState } from "react"
import TableHead from "./TableHead"
import TableRow from "./TableRow"

function LegsWorkout({ target, reps }){
// Squats
    const [squatExercise, setSquatExercise] = useState("bs")

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
const [splitSquatsExercise, setSplitSquatsExercise] = useState("dbss")

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
const [backExtensionExercise, setBackExtensionExercise] = useState("be")

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
const [calfRaisesExercise, setCalfRaisesExercise] = useState("crm")

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
            <TableHead reps={reps} />
            
            <tbody className="border px-4 py-2">
                <TableRow
                onChange={handleSelectSquatExercise}
                value={squatExercise}
                options={squatOptions}
                reps={reps}
                rowId='squats'
                />
                <TableRow 
                onChange={handleSelectSplitSquatsExercise}
                value={splitSquatsExercise}
                options={splitSquatsOptions}
                reps={reps}
                rowId='splits'
                />
                <TableRow
                onChange={handleSelectBackExtensionExercise}
                value={backExtensionExercise}
                options={backExtensionOptions}
                reps={reps}
                rowId='backextension'
                />
                <TableRow
                onChange={handleSelectCalfRaisesExercise}
                value={calfRaisesExercise}
                options={calfRaisesOptions}
                reps={reps}
                rowId='calf'
                />
            </tbody>
         </table>
     </div>)
 }
 
 export default LegsWorkout