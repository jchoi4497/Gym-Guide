import { useState } from "react"
import DropDown from "../DropDown"
import ChestWorkout from "../ChestWorkout"
import BackWorkout from "../BackWorkout"
import LegsWorkout from "../LegsWorkout"
import ShouldersWorkout from "../ShouldersWorkout"

function HypertophyPage() {
    const [selection, setSelection] = useState(null)
    const [repSelection, setRepSelection] = useState(null)
    const [showPlan, setShowPlan] = useState(false)

    const handleSelect = (option) => {
        setSelection(option)
    }

    const repHandleSelect = (option) => {
        setRepSelection(option)
    }

    const createClick = () => {
        setShowPlan(!showPlan)
    }

    const options = [
        {label: "Chest/Triceps", value: "chest"},
        {label: "Back/Biceps", value: "back"},
        {label: "Legs", value: "legs"},
        {label: "Shoulders/Forearms", value: "shoulders"}
    ]

    const setOptions = [
        {label: "3x15", value: "3"},
        {label: "4x12", value: "4"},
        {label: "5x8", value: "5"}
    ]


    return <div className="bg-sky-100 min-h-screen pt-10 font-serif pb-80">
                <div className="text-6xl mb-6 ml-10">Hypertophy Training</div>
                <div className="italic ml-10">Training program designed to increase muscle size and mass.</div>

                <div className="flex m-10 space-x-12">
                    <div className="">
                        STEP 1. Select Muscle Group to Target.
                        <DropDown className="" options={options} value={selection} onChange={handleSelect}/>
                    </div>
                    <div className="">
                        STEP 2. Select Set x Rep Range
                        <DropDown className="" options={setOptions} value={repSelection} onChange={repHandleSelect}/>
                    </div> 
                    <div className="m-6">
                    <button className="px-5 py-2 rounded-3xl shadow-lg text-white
                                    transition-all duration-300 bg-blue-700 hover:filter 
                                    hover:bg-blue-800 active:bg-blue-400 cursor-pointer"
                            onClick={createClick}
                    >
                        Create Plan
                     </button>
                    </div>
                </div>

                {selection?.value === "chest" && showPlan && <ChestWorkout target={selection} reps={repSelection} />}
                {selection?.value === "back" && showPlan && <BackWorkout target={selection} reps={repSelection} />}
                {selection?.value === "legs" && showPlan && <LegsWorkout target={selection} reps={repSelection} />}
                {selection?.value === "shoulders" && showPlan && <ShouldersWorkout target={selection} reps={repSelection} />}


            </div>
}

export default HypertophyPage