import { useState } from "react"
import TableHead from "./TableHead"
import TableRow from "./TableRow"

function BackWorkout({ target, reps, label, inputs, onInput}){

    const pullUpOptions = [
        {label: "Pull Ups", value: "pu"},
        {label: "Assisted Pull Ups", value: "apu" },
        {label: "Lat Pull Downs", value: "lpd"},
        {label: "Band Assist Pull Ups", value: "bapu"},
        {label: "Negative Pull Ups", value: "npu"},
    ]

    const rowsOptions = [
        {label: "Machine Rows", value: "mr"},
        {label: "Bent Over Rows Barbell", value: "borb" },
        {label: "Bent Over Rows Dumbbell", value: "bord"},
        {label: "1 Arm Bent Over Rows", value: "1abor"},
        {label: "T-bar row", value: "tbr"},
        {label: "Cable Rows 1 Arm", value: "cr1a"},
        {label: "Cable Rows w/ Bar", value: "crb"},
    ]

    const latsOptions = [
        {label: "Lat Pull Downs", value: "lpd2"},
        {label: "Assisted Pull Ups", value: "apu2" },
        {label: "V-bar Pull Downs", value: "vbpd"},
        {label: "Neutral Grip Lat Pull Downs", value: "nglpd"},
        {label: "Straight Arm Pull Downs", value: "sapd"},
    ]

    const bicepOptions = [
        {label: "Dumbbell Bicep Curls", value: "dbc"},
        {label: "Straight Bar Bicep Curls", value: "sbbc" },
        {label: "Straight Bar Preacher Curls", value: "sbpc"},
        {label: "Dumbbell Preacher Curls", value: "dpc"},
        {label: "Cable Curls w/ Bar Grip", value: "ccbg"},
        {label: "Machine Bicep Curls", value: "mbc"},
    ]

    const bicepTwoOptions = [
        {label: "Straight Bar Preacher Curls", value: "sbpc2"},
        {label: "Straight Bar Bicep Curls", value: "sbbc2" },
        {label: "Dumbbell Bicep Curls", value: "dbc2"},
        {label: "Dumbbell Preacher Curls", value: "dpc2"},
        {label: "Cable Curls w/ Bar Grip", value: "ccbg2"},
        {label: "Machine Bicep Curls", value: "mbc2"},
    ]

    const [exercises, setExercises] = useState([
        {id: "pullup", selected: "pu", options: pullUpOptions},
        {id: "row", selected: "mr", options: rowsOptions},
        {id: "lat", selected: "lpd2", options: latsOptions},
        {id: "bicep", selected: "dbc", options: bicepOptions},
        {id: "bicep2", selected: "sbpc2", options: bicepTwoOptions},
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
 
 export default BackWorkout