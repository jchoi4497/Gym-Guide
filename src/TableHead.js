
function TableHead ({ reps }) {
    const headerCell = function () {
        const headerElement = []
        for(let i = 1; i <= Number(reps); i++){
            headerElement.push(
                <th key={`set-${i}`} className="border px-4 py-2"> Set {i} </th>
            )
        }
        return headerElement
    }

    return (
        <thead>
            <tr>
                <th className="border px-4 py-2"> Exercise </th>
                {headerCell()}
            </tr>
        </thead>
    )

}

export default TableHead