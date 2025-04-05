import TableHead from "./TableHead"
import TableRow from "./TableRow"

function LegsWorkout({ target, reps }){
    return (
     <div className="flex justify-center font-serif bg-white">
         <table className="border w-full">
            <caption className="text-xl font-bold mb-4 border-t"> {target?.label} - {reps?.label} </caption>
            <TableHead target={target} reps={reps} muscle="legs" />
            
            <tbody className="border px-4 py-2">
                <TableRow desc="Squats" target={target} reps={reps} muscle="legs"/>
                <TableRow desc="Split Squats" target={target} reps={reps} muscle="legs"/>
                <TableRow desc="Back Extensions" target={target} reps={reps} muscle="legs"/>
                <TableRow desc="Calf Raises" target={target} reps={reps} muscle="legs"/>
            </tbody>
         </table>
     </div>)
 }
 
 export default LegsWorkout