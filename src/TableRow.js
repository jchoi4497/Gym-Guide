import DropDown from "./DropDown"

function TableRow ({target, reps, muscle, onChange, options, value}) {
    return  (
        <tr>
            <td className="border px-4 py-2">
                <DropDown options={options} onChange={onChange} value={value} />
            </td>
            <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps " /></form></td>
            <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps " /></form></td>
            <td className="border px-4 py-2"> <form> <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps " /></form></td>
                {target?.value === muscle && reps?.value === "4" && 
                    <td className="border px-4 py-2">
                        <form>
                            <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps " />
                        </form>
                    </td>
                }
                {target?.value === muscle && reps?.value === "5" &&
                    (<>
                        <td className="border px-4 py-2">
                            <form>
                                <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps " />
                            </form>
                        </td>
                        <td className="border px-4 py-2">
                            <form>
                                <input className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps " />
                            </form>
                        </td>
                    </>
                    )}
        </tr>
    )
}

export default TableRow