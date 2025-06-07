import TableHead from "./TableHead";
import TableRow from "./TableRow";

function WorkoutTable({ label, target, reps, exercises, onExerciseChange, onCellInput, inputs }) {
  return (
    <div className="overflow-x-auto rounded-2xl shadow-lg bg-white mb-8">
      <table className="table-auto w-full border-collapse">
        <caption className="text-xl font-bold mb-4 py-3 bg-blue-50 ">
          {label} - {target}
        </caption>

        <TableHead reps={reps} />

        <tbody className="divide-y divide-gray-200">
          {exercises.map(({ id, selected, options }) => (
            <TableRow
              key={id}
              value={selected}
              options={options}
              reps={reps}
              rowId={id}
              inputs={inputs[id]?.input}
              onChange={(newOption) => onExerciseChange(id, newOption)}
              cellInput={(index, inputValue) =>
                onCellInput(id, selected, index, inputValue)
              }
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WorkoutTable;