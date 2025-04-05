import TableHead from "./TableHead"
import TableRow from "./TableRow"

function BackWorkout({ target, reps}){
    return (
     <div className="flex justify-center font-serif bg-white">
 
         <table className="border w-full">
            <caption className="text-xl font-bold mb-4 border-t"> {target?.label} - {reps?.label} </caption>
            <TableHead target={target} reps={reps} muscle="back" />
            
            <tbody className="border px-4 py-2">
                <TableRow desc="Pull Ups" target={target} reps={reps} muscle="back"/>
                <TableRow desc="Rows" target={target} reps={reps} muscle="back"/>
                <TableRow desc="Lat Pull Downs" target={target} reps={reps} muscle="back"/>
                <TableRow desc="Bicep Curls" target={target} reps={reps} muscle="back"/>
                <TableRow desc="Bicep Curls" target={target} reps={reps} muscle="back"/> 
            </tbody>

         </table>
     </div>)
 }
 
 export default BackWorkout