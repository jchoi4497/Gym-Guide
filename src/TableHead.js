

function TableHead ({ target, reps, muscle}) {
    return (
        <thead>
            <tr>
                <th className="border px-4 py-2">Exercise</th>
                <th className="border px-4 py-2">Set 1</th>
                <th className="border px-4 py-2">Set 2</th>
                <th className="border px-4 py-2">Set 3</th>
                {target?.value === muscle && reps?.value === "4" && <th className="border px-4 py-2">Set 4</th>}
                {target?.value === muscle && reps?.value === "5" &&
                (<>
                    <th className="border px-4 py-2">Set 4</th>
                    <th className="border px-4 py-2">Set 5</th>
                </>
                )}
            </tr>
        </thead>
    )

}

export default TableHead