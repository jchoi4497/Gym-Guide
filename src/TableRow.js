import DropDown from "./DropDown";

function TableRow({ reps, onChange, options, value, rowId, cellInput, inputs, exercise }) {

    const recordInputCells = function () {
        const cellElements = [];
        for (let i = 0; i < Number(reps); i++) {
            cellElements.push(
                <td key={i + rowId} className="border border-gray-300 rounded-md px-4 py-2 bg-white shadow-sm">
                    <input
                        id={`${rowId}-cell-${i}`}
                        className="
                            px-3 py-2 w-full rounded-md
                            bg-gradient-to-r from-blue-50 to-blue-100
                            focus:outline-none focus:ring-2 focus:ring-blue-400
                            transition-colors duration-300
                            placeholder-gray-400 text-gray-900
                            "
                        type="text"
                        placeholder=" Weight x Reps "
                        value={inputs && inputs[i] || ''}
                        onChange={(e) => cellInput(i, e.target.value)}
                    />
                </td>
            );
        }
        return cellElements;
    };

    return (
        <tr>
            <td className="border border-gray-300 rounded-md px-4 py-2 bg-white shadow-sm">
                <DropDown
                    options={options}
                    onChange={onChange}
                    value={value}
                />
            </td>
            {recordInputCells()}
        </tr>
    );
}

export default TableRow;