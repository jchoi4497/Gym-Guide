function LegsWorkout({ target, reps}){
    return (
     <div className="flex justify-center font-serif bg-white">
 
         <table className="border w-full">
         <caption className="text-xl font-bold mb-4 border-t"> {target?.label} x {reps?.label} </caption>
         <thead>
             <tr>
                 <th className="border px-4 py-2">Exercise</th>
                 <th className="border px-4 py-2">Set 1</th>
                 <th className="border px-4 py-2">Set 2</th>
                 <th className="border px-4 py-2">Set 3</th>
                 {target?.value === "legs" && reps?.value === "4" && <th className="border px-4 py-2">Set 4</th>}
                 {target?.value === "legs" && reps?.value === "5" && ( <> <th className="border px-4 py-2">Set 4</th> <th className="border px-4 py-2">Set 5</th> </> )}
             </tr>
         </thead>
         
         <tbody className="border px-4 py-2">
             <tr className="border px-4 py-2">
                 <td className="border px-4 py-2">Squats</td>
                 <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>
                 <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>
                 <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>
                 {target?.value === "legs" && reps?.value === "4" && <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>}
                 {target?.value === "legs" && reps?.value === "5" && (<> <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td> <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td> </> )}
             </tr>
             <tr className="border px-4 py-2">
                 <td className="border px-4 py-2">Split Squats</td>
                 <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>
                 <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>
                 <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>
                 {target?.value === "legs" && reps?.value === "4" && <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>}
                 {target?.value === "legs" && reps?.value === "5" && (<> <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td> <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td> </> )}
             </tr>
             <tr className="border px-4 py-2">
                 <td className="border px-4 py-2">Back Extensions</td>
                 <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>
                 <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>
                 <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>
                 {target?.value === "legs" && reps?.value === "4" && <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>}
                 {target?.value === "legs" && reps?.value === "5" && (<> <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td> <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td> </> )}
             </tr>
             <tr className="border px-4 py-2">
                 <td className="border px-4 py-2">Calf Raises</td>
                 <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>
                 <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>
                 <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>
                 {target?.value === "legs" && reps?.value === "4" && <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td>}
                 {target?.value === "legs" && reps?.value === "5" && (<> <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td> <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps "></input></form> </td> </> )}
             </tr>
 
         </tbody>
         </table>
     </div>)
 }
 
 export default LegsWorkout