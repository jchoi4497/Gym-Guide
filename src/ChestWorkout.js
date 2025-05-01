import { useState } from "react"
import TableHead from "./TableHead"
import TableRow from "./TableRow"

function ChestWorkout({ target, reps, label, inputs, onInput }){

    const inclineExerciseOptions = [
        {label: "Dumbbell Incline Press", value: "dip"},
        {label: "Machine Incline Press", value: "mip" },
        {label: "Smith Machine Incline Press", value: "smip"},
        {label: "Barbell Incline Press", value: "bip"}
    ]

    const chestPressExerciseOptions = [
        {label: "Dumbbell Press", value: "dp"},
        {label: "Machine Press", value: "mp"},
        {label: "Smith Machine Press", value: "smp"},
        {label: "Barbell Press", value: "bp"},
    ]

    const chestFlyExerciseOptions = [
        {label: "Chest Fly Machine", value: "cfm"},
        {label: "Cable Flys", value: "cf"},
        {label: "Dumbbell Flys", value: "df"},
    ]

    const tricepExerciseOptions = [
        {label: "Straight Bar Cable Push Downs", value: "sbcpd"},
        {label: "Rope Pull Downs", value: "rpd"},
        {label: "1 Arm Cable Pull Downs", value: "1acpd"},
        {label: "Overhead Bar Cable Extensions", value: "obce"},
        {label: "Overhead Dumbbell Extensions", value: "ode"},
        {label: "Dips", value: "d"},
    ]

    const tricepExerciseOptionsTwo = [
        {label: "1 Arm Cable Pull Downs", value: "1acpd"},
        {label: "Rope Pull Downs", value: "rpd"},
        {label: "Straight Bar Cable Push Downs", value: "sbcpd"},
        {label: "Overhead Bar Cable Extensions", value: "obce"},
        {label: "Overhead Dumbbell Extensions", value: "ode"},
        {label: "Dips", value: "d"},
    ]

    const [exercises, setExercises] = useState([
        {id: "incline", selected: "dip", options: inclineExerciseOptions},
        {id: "chestpress", selected: "mp", options: chestPressExerciseOptions},
        {id: "fly", selected: "cfm", options: chestFlyExerciseOptions},
        {id: "tri", selected: "sbcpd", options: tricepExerciseOptions},
        {id: "tri2", selected: "1acpd", options: tricepExerciseOptionsTwo},
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

export default ChestWorkout