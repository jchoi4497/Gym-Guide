import { useState } from "react"
import TableHead from "./TableHead"
import TableRow from "./TableRow"

function BackWorkout({ target, reps}){
// Pull Ups
    const [pullUpExercise, setPullUpExercise] = useState("pu")

    const handleSelectPullUpExercise = (option) => {
        setPullUpExercise(option)
    }

    const pullUpOptions = [
        {label: "Pull Ups", value: "pu"},
        {label: "Assisted Pull Ups", value: "apu" },
        {label: "Lat Pull Downs", value: "lpd"},
        {label: "Band Assist Pull Ups", value: "bapu"},
        {label: "Negative Pull Ups", value: "npu"},
    ]

// Rows
    const [rowsExercise, setRowsExercise] = useState("mr")

    const handleSelectRowsExercise = (option) => {
        setRowsExercise(option)
    }

    const rowsOptions = [
        {label: "Machine Rows", value: "mr"},
        {label: "Bent Over Rows Barbell", value: "borb" },
        {label: "Bent Over Rows Dumbbell", value: "bord"},
        {label: "1 Arm Bent Over Rows", value: "1abor"},
        {label: "T-bar row", value: "tbr"},
        {label: "Cable Rows 1 Arm", value: "cr1a"},
        {label: "Cable Rows w/ Bar", value: "crb"},
    ]

// Lat exercises
    const [latsExercise, setLatsExercise] = useState("lpd2")

    const handleSelectLatsExercise = (option) => {
        setLatsExercise(option)
    }

    const latsOptions = [
        {label: "Lat Pull Downs", value: "lpd2"},
        {label: "Assisted Pull Ups", value: "apu2" },
        {label: "V-bar Pull Downs", value: "vbpd"},
        {label: "Neutral Grip Lat Pull Downs", value: "nglpd"},
        {label: "Straight Arm Pull Downs", value: "sapd"},
    ]

// Bicep exercises
const [bicepExercise, setBicepExercise] = useState("dbc")

const handleSelectBicepExercise = (option) => {
    setBicepExercise(option)
}

const bicepOptions = [
    {label: "Dumbbell Bicep Curls", value: "dbc"},
    {label: "Straight Bar Bicep Curls", value: "sbbc" },
    {label: "Straight Bar Preacher Curls", value: "sbpc"},
    {label: "Dumbbell Preacher Curls", value: "dpc"},
    {label: "Cable Curls w/ Bar Grip", value: "ccbg"},
    {label: "Machine Bicep Curls", value: "mbc"},
]

const [bicepTwoExercise, setBicepTwoExercise] = useState("dbpc2")

const handleSelectBicepTwoExercise = (option) => {
    setBicepTwoExercise(option)
}

const bicepTwoOptions = [
    {label: "Straight Bar Preacher Curls", value: "dbpc2"},
    {label: "Straight Bar Bicep Curls", value: "sbbc2" },
    {label: "Dumbbell Bicep Curls", value: "dbc2"},
    {label: "Dumbbell Preacher Curls", value: "dpc2"},
    {label: "Cable Curls w/ Bar Grip", value: "ccbg2"},
    {label: "Machine Bicep Curls", value: "mbc2"},
]


    return (
     <div className="flex justify-center font-serif bg-white">
 
         <table className="border w-full">
            <caption className="text-xl font-bold mb-4 border-t"> {target?.label} - {reps?.label} </caption>
            <TableHead reps={reps} />
            
            <tbody className="border px-4 py-2">
                <TableRow
                    onChange={handleSelectPullUpExercise}
                    value={pullUpExercise}
                    options={pullUpOptions}
                    reps={reps}
                    rowId='pullup'
                />
                <TableRow
                    onChange={handleSelectRowsExercise}
                    value={rowsExercise}
                    options={rowsOptions}
                    reps={reps}
                    rowId='rows'
                />
                <TableRow
                    onChange={handleSelectLatsExercise}
                    value={latsExercise}
                    options={latsOptions}
                    reps={reps}
                    rowId='lats'
                />
                <TableRow
                    onChange={handleSelectBicepExercise}
                    value={bicepExercise}
                    options={bicepOptions}
                    reps={reps}
                    rowId='bicep1'
                />
                <TableRow
                    onChange={handleSelectBicepTwoExercise}
                    value={bicepTwoExercise}
                    options={bicepTwoOptions}
                    reps={reps}
                    rowId='bicep2'
                /> 
            </tbody>

         </table>
     </div>)
 }
 
 export default BackWorkout