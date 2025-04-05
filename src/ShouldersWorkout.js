import TableHead from "./TableHead"
import TableRow from "./TableRow"

function ShouldersWorkout({ target, reps}){
    return (
     <div className="flex justify-center font-serif bg-white">
 
         <table className="border w-full">
            <caption className="text-xl font-bold mb-4 border-t"> {target?.label} - {reps?.label} </caption>
            <TableHead target={target} reps={reps} muscle="shoulders" />
            
            <tbody className="border px-4 py-2">
                <TableRow desc="Rear Delt Machine" target={target} reps={reps} muscle="shoulders"/>
                <TableRow desc="Dumbell Lateral Raises" target={target} reps={reps} muscle="shoulders"/>
                <TableRow desc="Cable Rear Delt Flys" target={target} reps={reps} muscle="shoulders"/>
                <TableRow desc="Cable Lateral Raises" target={target} reps={reps} muscle="shoulders"/>
                <TableRow desc="Cable Wrist Curls" target={target} reps={reps} muscle="shoulders"/>
                <TableRow desc="Dumbell Reverse Wrist Curls" target={target} reps={reps} muscle="shoulders"/>
            </tbody>
            
         </table>
     </div>)
 }
 
 export default ShouldersWorkout