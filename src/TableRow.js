import DropDown from "./DropDown"

function TableRow ({target, reps, muscle, onChange, options, value}) {
    return  (
        <tr>
            <td className="border px-4 py-2">
                <DropDown options={options} onChange={onChange} value={value} />
            </td>
            <td className="border px-4 py-2"> <form> <input id="set1" className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps " /></form></td>
            <td className="border px-4 py-2"> <form> <input id="set2" className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps " /></form></td>
            <td className="border px-4 py-2"> <form> <input id="set3" className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps " /></form></td>
                {target?.value === muscle && reps?.value === "4" && 
                    <td className="border px-4 py-2">
                        <form>
                            <input id="set4" className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps " />
                        </form>
                    </td>
                }
                {target?.value === muscle && reps?.value === "5" &&
                    (<>
                        <td className="border px-4 py-2">
                            <form>
                                <input id="set4/5" className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps " />
                            </form>
                        </td>
                        <td className="border px-4 py-2">
                            <form>
                                <input id="set5" className="px-2 py-1 w-full" type="text" placeholder=" Weight x Reps " />
                            </form>
                        </td>
                    </>
                    )}
        </tr>
    )
}

export default TableRow