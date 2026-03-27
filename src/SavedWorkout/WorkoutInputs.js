import exerciseNames from '../exerciseNames';
import DataChart from '../DataChart';
import ExerciseAutocomplete from '../components/ExerciseAutocomplete';
import { getPlaceholderForExercise, getExerciseById } from '../config/exerciseConfig';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Parse "145x12" format into weight and reps
const parseSet = (setString) => {
  if (!setString || setString.trim() === '') {
    return { weight: '', reps: '' };
  }

  if (setString.includes('x')) {
    const [weight, reps] = setString.split('x').map(s => s.trim());
    return { weight: weight || '', reps: reps || '' };
  }

  // Bodyweight (just reps, no weight)
  return { weight: '', reps: setString.trim() };
};

// Combine weight and reps back to "145x12" format
const combineSet = (weight, reps) => {
  const w = weight.trim();
  const r = reps.trim();

  if (!w && !r) return '';
  if (!w) return r; // Bodyweight - just reps
  if (!r) return w + 'x'; // Weight entered but no reps yet
  return `${w}x${r}`;
};

// Sortable Exercise Item Component
function SortableExerciseItem({
  exerciseKey,
  data,
  prevData,
  isEditing,
  editedInputs,
  setEditedInputs,
  onRemove,
  monthlyWorkoutData,
  graphView,
  previousCustomExercises,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exerciseKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-8 p-4 bg-sky-50 rounded-2xl shadow-lg relative"
    >
      {/* Drag Handle - Only visible when editing */}
      {isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing bg-blue-500 text-white w-8 h-12 rounded-lg flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors z-10"
          title="Drag to reorder"
        >
          <span className="text-xl">⋮⋮</span>
        </div>
      )}

      {/* DELETE BUTTON: Only shows when editing */}
      {isEditing && (
        <button
          onClick={() => onRemove(exerciseKey)}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 z-20 cursor-pointer"
        >
          ✕
        </button>
      )}

      <div className="text-2xl font-bold mb-2 flex items-center gap-4">
        {/* EXERCISE NAME: If it's a new custom exercise or we are editing, allow name change */}
        {isEditing ? (
          <ExerciseAutocomplete
            value={exerciseNames[data.exerciseName || data.selection] || data.exerciseName || data.selection}
            onChange={(value) => {
              const newInputs = { ...editedInputs };
              newInputs[exerciseKey].exerciseName = value;
              newInputs[exerciseKey].selection = value; // Keep for backward compatibility
              setEditedInputs(newInputs);
            }}
            onSelect={(exercise) => {
              const newInputs = { ...editedInputs };
              newInputs[exerciseKey].exerciseName = exercise.name;
              newInputs[exerciseKey].selection = exercise.isPreset ? exercise.id : exercise.name; // Link to preset ID if preset
              newInputs[exerciseKey].linkedExerciseId = exercise.id; // Store linked ID for data comparison
              if (exercise.category) {
                newInputs[exerciseKey].detectedCategory = exercise.category; // Store detected category
              }
              setEditedInputs(newInputs);
            }}
            previousCustomExercises={previousCustomExercises}
            placeholder="Exercise Name"
            className="bg-transparent border-b-2 border-sky-200 focus:border-sky-500 outline-none px-1 w-full"
          />
        ) : (
          exerciseNames[data.exerciseName || data.selection] || data.exerciseName || data.selection
        )}
      </div>

      <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 sm:space-y-0">
        <div className="flex-1 flex flex-col gap-3">
          {/* Set Inputs */}
          <div className="flex flex-wrap gap-3">
            {(data.sets || data.input || []).map((setData, idx) => {
              const currentSet = parseSet((editedInputs[exerciseKey]?.sets || editedInputs[exerciseKey]?.input)?.[idx] || setData || '');

              // Determine exercise type for proper input display
              const exerciseId = data.selection || data.exerciseName;
              const exercise = getExerciseById(exerciseId);
              const placeholder = getPlaceholderForExercise(exerciseId);

              // Check metric type for determining which inputs to show
              const isBodyweight = exercise?.metricType === 'bodyweight' || placeholder === 'Reps';
              const isTimed = exercise?.metricType === 'timed' || placeholder.includes('Duration') || placeholder.includes('sec');
              const isCardio = placeholder.includes('min') || placeholder.includes('mi');
              const showWeightInput = !isBodyweight && !isTimed && !isCardio;

              return (
                <div key={idx}>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      {showWeightInput && (
                        <>
                          <input
                            type="number"
                            inputMode="decimal"
                            placeholder="lbs"
                            value={currentSet.weight}
                            onChange={(e) => {
                              const combined = combineSet(e.target.value, currentSet.reps);
                              const newInputs = { ...editedInputs };
                              if (!newInputs[exerciseKey].sets) newInputs[exerciseKey].sets = [];
                              if (!newInputs[exerciseKey].input) newInputs[exerciseKey].input = [];
                              newInputs[exerciseKey].sets[idx] = combined;
                              newInputs[exerciseKey].input[idx] = combined;
                              setEditedInputs(newInputs);
                            }}
                            className="px-2 py-3 w-20 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 placeholder-gray-400 text-gray-900 text-center text-lg"
                          />
                          <span className="text-gray-500 font-bold">×</span>
                        </>
                      )}
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder={isCardio ? placeholder : (isTimed ? "sec" : "reps")}
                        value={currentSet.reps}
                        onChange={(e) => {
                          const combined = combineSet(currentSet.weight, e.target.value);
                          const newInputs = { ...editedInputs };
                          if (!newInputs[exerciseKey].sets) newInputs[exerciseKey].sets = [];
                          if (!newInputs[exerciseKey].input) newInputs[exerciseKey].input = [];
                          newInputs[exerciseKey].sets[idx] = combined;
                          newInputs[exerciseKey].input[idx] = combined;
                          setEditedInputs(newInputs);
                        }}
                        className={`px-2 py-3 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 placeholder-gray-400 text-gray-900 text-center text-lg ${showWeightInput ? 'w-16' : 'w-20'}`}
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded bg-gradient-to-r from-blue-50 to-blue-100 text-xl min-w-[60px] text-center">
                      {setData || '-'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add/Remove Set Buttons - Only in Edit Mode */}
          {isEditing && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  const newInputs = { ...editedInputs };
                  if (!newInputs[exerciseKey].sets) newInputs[exerciseKey].sets = [];
                  if (!newInputs[exerciseKey].input) newInputs[exerciseKey].input = [];
                  newInputs[exerciseKey].sets.push('');
                  newInputs[exerciseKey].input.push('');
                  setEditedInputs(newInputs);
                }}
                className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-bold transition-colors cursor-pointer text-sm"
                title="Add another set"
              >
                + Add Set
              </button>
              <button
                onClick={() => {
                  const currentSets = editedInputs[exerciseKey]?.sets || editedInputs[exerciseKey]?.input || [];
                  if (currentSets.length > 1) {
                    const newInputs = { ...editedInputs };
                    newInputs[exerciseKey].sets = currentSets.slice(0, -1);
                    newInputs[exerciseKey].input = currentSets.slice(0, -1);
                    setEditedInputs(newInputs);
                  }
                }}
                disabled={(editedInputs[exerciseKey]?.sets || editedInputs[exerciseKey]?.input || []).length <= 1}
                className={`px-4 py-2 rounded-md font-bold transition-colors text-sm ${
                  (editedInputs[exerciseKey]?.sets || editedInputs[exerciseKey]?.input || []).length <= 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                }`}
                title="Remove last set"
              >
                - Remove Set
              </button>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="flex-1">
          <DataChart
            exerciseKey={exerciseKey}
            currentData={data}
            previousData={prevData}
            monthlyWorkoutData={monthlyWorkoutData}
            graphView={graphView}
          />
        </div>
      </div>
    </div>
  );
}

function WorkoutInputs({
  order,
  isEditing,
  editedInputs,
  workoutData,
  setEditedInputs,
  previousWorkoutData,
  monthlyWorkoutData,
  graphView,
  onRemove,
  onReorder,
  previousCustomExercises = [],
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevents accidental drags - must drag 8px before activating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = order.indexOf(active.id);
      const newIndex = order.indexOf(over.id);
      const newOrder = arrayMove(order, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };
  return (
    <div className="mb-8">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={order}
          strategy={verticalListSortingStrategy}
          disabled={!isEditing}
        >
          {order.map((key) => {
            // Handle both old (inputs) and new (exerciseData) field names
            const workoutExercises = isEditing ? editedInputs : (workoutData.exerciseData || workoutData.inputs);
            const data = workoutExercises[key];
            const prevWorkoutExercises = previousWorkoutData?.exerciseData || previousWorkoutData?.inputs;
            const prevData = prevWorkoutExercises?.[key];
            if (!data) return null;

            return (
              <SortableExerciseItem
                key={key}
                exerciseKey={key}
                data={data}
                prevData={prevData}
                isEditing={isEditing}
                editedInputs={editedInputs}
                setEditedInputs={setEditedInputs}
                onRemove={onRemove}
                monthlyWorkoutData={monthlyWorkoutData}
                graphView={graphView}
                previousCustomExercises={previousCustomExercises}
              />
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default WorkoutInputs;
