import DropDown from "./DropDown"

function TableRow ({ reps, onChange, options, value, rowId, onInput, inputs }) {

    const recordInputCells = function () {
        const cellElements = []
        for(let i = 0; i < Number(reps); i++){
            cellElements.push(
                <td key={i + rowId} className="border px-4 py-2">  
                    <input
                        id={`${rowId}-cell-${i}`}
                        className="px-2 py-1 w-full"
                        type="text"
                        placeholder=" Weight x Reps "
                        value={inputs && inputs[rowId] && inputs[rowId][i] || ''}
                        onChange={(e) => onInput(i, e.target.value)}
                    />
                </td> 
            )
        }
        return cellElements
    }

    return  (
        <tr>
            <td className="border px-4 py-2">
                <DropDown
                    options={options}
                    onChange={onChange}
                    value={value}
                />
            </td>
            {recordInputCells()}
        </tr>
    )
}

export default TableRow