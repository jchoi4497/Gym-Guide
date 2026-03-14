import TableRow from './TableRow';

function WorkoutTable({
  setRangeLabel,
  muscleGroup,
  numberOfSets,
  exercises,
  onExerciseChange,
  onCellInput,
  exerciseData,
  onRemove,
}) {
  return (
    <div className="rounded-2xl shadow-lg bg-sky-50 mb-8 p-4">
      <div className="text-xl font-bold mb-4 py-3 bg-blue-50 rounded-md text-center">
        {setRangeLabel} - {muscleGroup}
      </div>

      <div className="flex flex-col">
        {exercises.map((exercise) => (
          <TableRow
            key={exercise.id}
            rowId={exercise.id}
            value={exercise.selected}
            options={exercise.options}
            isCustom={exercise.isCustom}
            numberOfSets={numberOfSets}
            setInputs={exerciseData[exercise.id]?.input}
            onChange={(newOption) => onExerciseChange(exercise.id, newOption)}
            cellInput={(index, inputValue) =>
              onCellInput(exercise.id, exercise.selected, index, inputValue)
            }
            onRemove={() => onRemove(exercise.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default WorkoutTable;
