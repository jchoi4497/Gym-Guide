import { useState, useMemo } from "react"
import DropDown from "../DropDown"
import ChestWorkout from "../ChestWorkout"
import BackWorkout from "../BackWorkout"
import LegsWorkout from "../LegsWorkout"
import ShouldersWorkout from "../ShouldersWorkout"
import db from '../firebase'
import { collection, addDoc } from "firebase/firestore"


function StrengthPage() {
    const [selection, setSelection] = useState(null)
    const [setCountSelection, setSetCountSelection] = useState(null)
    const [inputs, setInputs] = useState({})

    const onInput = (row, exercise, index, input) => {
        const inputData = {...inputs}
        if(!inputData[row]){
            const input = new Array(setCountSelection).fill('')
            inputData[row] = {
                input,
                selection: exercise,
            }
        }

       if(index === -1){
        inputData[row].selection = exercise
       } else {

        inputData[row].input[index] = input
       }
       
       console.log(inputData)
        setInputs(inputData)
    }

    const handleSelect = (option) => {
        setSelection(option)
    }

    const repHandleSelect = (option) => {
        setSetCountSelection(option)
    }

    const handleSaveWorkout = async () => {
        const workoutDoc = await addDoc(collection(db, "workoutLogs"), {
            // target: selection,
            // reps: setCountSelection,
            // timestamp: new Date(),
            inputs: inputs
        })
    }

    const options = [
        {label: "Chest/Triceps", value: "chest"},
        {label: "Back/Biceps", value: "back"},
        {label: "Legs", value: "legs"},
        {label: "Shoulders/Forearms", value: "shoulders"}
    ]

    const setOptions = [
        {label: "3x6", value: "3"},
        {label: "4x8", value: "4"},
        {label: "5x5", value: "5"}
    ]

    const label = useMemo(() => {
        return setOptions.find(option => {
            return option.value === setCountSelection
        })?.label
    })

    return <div className="bg-sky-100 min-h-screen pt-10 font-serif pb-80 px-20">
                <div className="text-6xl mb-6 ml-10">Strength Training</div>
                <div className="mb-6 italic ml-10">Training program designed to build muscle strength and mass</div>

                <div className="flex m-10 space-x-12">
                    <div className="">STEP 1. Select Muscle Group to Target.
                        <DropDown className="" options={options} value={selection} onChange={handleSelect}/>
                    </div>
                    <div className="">STEP 2. Select Set x Rep Range
                        <DropDown className="" options={setOptions} value={setCountSelection} onChange={repHandleSelect}/>
                    </div> 
                </div>
                {selection === "chest" && setCountSelection && <ChestWorkout target={selection} reps={setCountSelection} label={label} inputs={inputs} onInput={onInput} />}
                {selection === "back" && setCountSelection && <BackWorkout target={selection} reps={setCountSelection} label={label} inputs={inputs} onInput={onInput} />}
                {selection === "legs" && setCountSelection && <LegsWorkout target={selection} reps={setCountSelection} label={label} inputs={inputs} onInput={onInput} />}
                {selection === "shoulders" && setCountSelection && <ShouldersWorkout target={selection} reps={setCountSelection} label={label} inputs={inputs} onInput={onInput} />}

                <div className="m-6 flex justify-end">
                    <button className="px-5 py-2 rounded-3xl shadow-lg text-white
                                    transition-all duration-300 bg-blue-700 hover:filter 
                                    hover:bg-blue-800 active:bg-blue-400 cursor-pointer"
                            onClick={handleSaveWorkout}
                    >
                        Save Plan
                    </button>
                    </div>

            </div>
}

export default StrengthPage