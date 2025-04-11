import { useState } from "react"
import TableHead from "./TableHead"
import TableRow from "./TableRow"

function ShouldersWorkout({ target, reps}){
// Rear Delt 

    const [rearDeltExercise, setRearDeltExercise] = useState(null)

    const handleSelectRearDeltExercise = (option) => {
        setRearDeltExercise(option)
    }

    const rearDeltExerciseOptions = [
        {label: "Rear Delt Machine", value: "rdm"},
        {label: "1 Arm Rear Delt Machine", value: "1ardm" },
        {label: "Cable Rear Delt Flys", value: "crdf"},
        {label: "1 Arm Cable Rear Delt Flys", value: "1arcdf"},
        {label: "Dumbbell Rear Delt Flys", value: "drdf"},
        {label: "Cable Face Pulls", value: "cfp"},
    ]

    const [rearDeltTwoExercise, setRearDeltTwoExercise] = useState(null)

    const handleSelectRearDeltTwoExercise = (option) => {
        setRearDeltTwoExercise(option)
    }

    const rearDeltTwoExerciseOptions = [
        {label: "1 Arm Cable Rear Delt Flys", value: "1acrdf2"},
        {label: "Cable Rear Delt Flys", value: "crdf2"},
        {label: "1 Arm Rear Delt Machine", value: "1ardm2" },
        {label: "Rear Delt Machine", value: "rdm2"},
        {label: "Dumbbell Rear Delt Flys", value: "drdf2"},
        {label: "Cable Face Pulls", value: "cfp2"},
    ]

// Lat Raises

    const [LatRaisesExercise, setLatRaisesExercise] = useState(null)

    const handleSelectLatRaisesExercise = (option) => {
        setLatRaisesExercise(option)
    }

    const LatRaisesExerciseOptions = [
        {label: "Dumbbell Lat Raises", value: "dlr"},
        {label: "1 Arm Cable Lat Raises", value: "1acdlr" },
        {label: "Machine Lat Raises", value: "mlr"},
    ]

    const [LatRaisesTwoExercise, setLatRaisesTwoExercise] = useState(null)

    const handleSelectLatRaisesTwoExercise = (option) => {
        setLatRaisesTwoExercise(option)
    }

    const LatRaisesTwoExerciseOptions = [
        {label: "1 Arm Cable Lat Raises", value: "1acdlr2" },
        {label: "Dumbbell Lat Raises", value: "dlr2"},
        {label: "Machine Lat Raises", value: "mlr2"},
    ]

// Wrist Curls
    const [wristCurlsExercise, setWristCurlsExercise] = useState(null)

    const handleSelectWristCurlsExercise = (option) => {
        setWristCurlsExercise(option)
    }

    const wristCurlOptions = [
        {label: "Cable Wrist Curls w/ Bar", value: "cwc"},
        {label: "Barbell Behind Back Wrist Curls", value: "bbbwc"},
        {label: "Dumbbell Wrist Curls", value: "dbwc" },
    ]

// Reverse Wrist Curls
    const [reverseWristCurlsExercise, setReverseWristCurlsExercise] = useState(null)

    const handleSelectReverseWristCurlsExercise = (option) => {
        setReverseWristCurlsExercise(option)
    }

    const reverseWristCurlOptions = [
        {label: "Reverse Dumbbell Wrist Curls", value: "dbwc" },
        {label: "Forearm Curls w/ Easy Bar", value: "fc" },
    ]



    return (
     <div className="flex justify-center font-serif bg-white">
 
         <table className="border w-full">
            <caption className="text-xl font-bold mb-4 border-t"> {target?.label} - {reps?.label} </caption>
            <TableHead reps={reps} />
            
            <tbody className="border px-4 py-2">
                <TableRow
                onChange={handleSelectRearDeltExercise}
                value={rearDeltExercise}
                options={rearDeltExerciseOptions}
                reps={reps}
                rowId='reardelt1'
                />
                <TableRow
                onChange={handleSelectLatRaisesExercise}
                value={LatRaisesExercise}
                options={LatRaisesExerciseOptions}
                reps={reps}
                rowId='latraise1'
                />
                <TableRow
                onChange={handleSelectRearDeltTwoExercise}
                value={rearDeltTwoExercise}
                options={rearDeltTwoExerciseOptions}
                reps={reps}
                rowId='reardelt2'
                />
                <TableRow
                onChange={handleSelectLatRaisesTwoExercise}
                value={LatRaisesTwoExercise}
                options={LatRaisesTwoExerciseOptions}
                reps={reps}
                rowId='latraise2'
                />
                <TableRow
                onChange={handleSelectWristCurlsExercise}
                value={wristCurlsExercise}
                options={wristCurlOptions}
                reps={reps}
                rowId='wristcurl'
                />
                <TableRow 
                onChange={handleSelectReverseWristCurlsExercise}
                value={reverseWristCurlsExercise}
                options={reverseWristCurlOptions}
                reps={reps}
                rowId='reversewrist'
                />
            </tbody>
            
         </table>
     </div>)
 }
 
 export default ShouldersWorkout