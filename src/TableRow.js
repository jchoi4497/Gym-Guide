import DropDown from "./DropDown";

function TableRow({ reps, onChange, options, value, rowId, cellInput, inputs }) {

    const recordInputCells = () => {
        const cellElements = [];
        for (let i = 0; i < Number(reps); i++) {
            cellElements.push(
                <input
                    key={i + rowId}
                    id={`${rowId}-cell-${i}`}
                    className="
                        px-3 py-2 w-full rounded-md
                        bg-gradient-to-r from-blue-50 to-blue-100
                        focus:outline-none focus:ring-2 focus:ring-blue-400
                        transition-colors duration-300
                        placeholder-gray-400 text-gray-900
                        mb-2 sm:mb-0
                    "
                    type="text"
                    placeholder="Weight x Reps"
                    value={inputs && inputs[i] || ''}
                    onChange={(e) => cellInput(i, e.target.value)}
                />
            );
        }
        return cellElements;
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border border-gray-300 rounded-md p-4 bg-sky-50 shadow-sm mb-4">
            <DropDown
                options={options}
                onChange={onChange}
                value={value}
            />
            <div className="flex flex-col sm:flex-row sm:gap-2 w-full">
                {recordInputCells()}
            </div>
        </div>
    );
}

export default TableRow;

