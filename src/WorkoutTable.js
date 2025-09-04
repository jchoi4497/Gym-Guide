import TableRow from "./TableRow";

function WorkoutTable({ label, target, reps, exercises, onExerciseChange, onCellInput, inputs }) {
  return (
    <div className="rounded-2xl shadow-lg bg-sky-50 mb-8 p-4">
      <div className="text-xl font-bold mb-4 py-3 bg-blue-50 rounded-md text-center">
        {label} - {target}
      </div>

      <div className="flex flex-col">
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
      </div>
    </div>
  );
}

export default WorkoutTable;
