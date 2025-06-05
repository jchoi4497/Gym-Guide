
function TableHead({ reps }) {
    const headerCell = function () {
        const headerElement = [];
        for (let i = 1; i <= Number(reps); i++) {
            headerElement.push(
                <th key={`set-${i}`} className="border px-4 py-2 text-center bg-white font-semibold"> Set {i} </th>
            );
        }
        return headerElement;
    };

    return (
        <thead>
            <tr>
                <th className="border px-4 py-2 text-left bg-white font-semibold"> Exercise </th>
                {headerCell()}
            </tr>
        </thead>
    );

}

export default TableHead;