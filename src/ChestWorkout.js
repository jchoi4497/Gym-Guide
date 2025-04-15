import { useState } from "react"
import TableHead from "./TableHead"
import TableRow from "./TableRow"
import { useEffect } from "react"

function ChestWorkout({ target, reps, onWorkoutDataChange }){


    const [inputData, setInputData] = useState ({})

    const handleInputChange = (rowId, index, value) => {
        setInputData(prev => {
            const updatedRow = prev[rowId] ? [...prev[rowId]] : []
            updatedRow[index] = value
            return { ...prev, [rowId]: updatedRow }
        })
    }

// incline chest 
    const [inclineChestExercise, setInclineChestExercise] = useState(null)

    const handleSelectInclineExercise = (option) => {
        setInclineChestExercise(option)
    }

    const inclineExerciseOptions = [
        {label: "Dumbbell Incline Press", value: "dip"},
        {label: "Machine Incline Press", value: "mip" },
        {label: "Smith Machine Incline Press", value: "smip"},
        {label: "Barbell Incline Press", value: "bip"}
    ]
// regular chest press
    const [chestPressExercise, setChestPressExercise] = useState(null)

    const handleSelectChestPressExercise = (option) => {
        setChestPressExercise(option)
    }

    const chestPressExerciseOptions = [
        {label: "Dumbbell Press", value: "dp"},
        {label: "Machine Press", value: "mp"},
        {label: "Smith Machine Press", value: "smp"},
        {label: "Barbell Press", value: "bp"},
    ]
// pec deck
    const [chestFlyExercise, setChestFlyExercise] = useState(null)

    const handleSelectChestFlyExercise = (option) => {
        setChestFlyExercise(option)
    }

    const chestFlyExerciseOptions = [
        {label: "Chest Fly Machine", value: "cfm"},
        {label: "Cable Flys", value: "cf"},
        {label: "Dumbbell Flys", value: "df"},
    ]
// Tri Pulldowns
    const [tricepExercise, setTricepExercise] = useState(null)

    const handleSelectTricepExercise = (option) => {
        setTricepExercise(option)
    }

    const tricepExerciseOptions = [
        {label: "Straight Bar Cable Push Downs", value: "sbcpd"},
        {label: "Rope Pull Downs", value: "rpd"},
        {label: "1 Arm Cable Pull Downs", value: "1acpd"},
        {label: "Overhead Bar Cable Extensions", value: "obce"},
        {label: "Overhead Dumbbell Extensions", value: "ode"},
        {label: "Dips", value: "d"},
    ]

    const [tricepExerciseTwo, setTricepExerciseTwo] = useState(null)

    const handleSelectTricepExerciseTwo = (option) => {
        setTricepExerciseTwo(option)
    }

    const tricepExerciseOptionsTwo = [
        {label: "1 Arm Cable Pull Downs", value: "1acpd"},
        {label: "Rope Pull Downs", value: "rpd"},
        {label: "Straight Bar Cable Push Downs", value: "sbcpd"},
        {label: "Overhead Bar Cable Extensions", value: "obce"},
        {label: "Overhead Dumbbell Extensions", value: "ode"},
        {label: "Dips", value: "d"},
    ]

   return (
    <div className="flex justify-center font-serif bg-white">
        <table className="border w-full">
            <caption className="text-xl font-bold mb-4 border-t"> {target?.label} - {reps?.label} </caption>
            <TableHead reps={reps} />
                        
            <tbody className="border px-4 py-2">
                <TableRow 
                    onChange={handleSelectInclineExercise}
                    value={inclineChestExercise}
                    options={inclineExerciseOptions}
                    reps={reps}
                    rowId='incline'
                />
                <TableRow
                    onChange={handleSelectChestPressExercise}
                    value={chestPressExercise}
                    options={chestPressExerciseOptions}
                    reps={reps}
                    rowId='chestpress'
                />
                <TableRow
                    onChange={handleSelectChestFlyExercise}
                    value={chestFlyExercise}
                    options={chestFlyExerciseOptions}
                    reps={reps}
                    rowId='chestfly'
                />
                <TableRow
                    onChange={handleSelectTricepExercise}
                    value={tricepExercise}
                    options={tricepExerciseOptions}
                    reps={reps}
                    rowId='tricep1'
                />
                <TableRow
                    onChange={handleSelectTricepExerciseTwo}
                    value={tricepExerciseTwo}
                    options={tricepExerciseOptionsTwo}
                    reps={reps}
                    rowId='tricep2'
                />
            </tbody>
        
        </table>
    </div>)
}

export default ChestWorkout