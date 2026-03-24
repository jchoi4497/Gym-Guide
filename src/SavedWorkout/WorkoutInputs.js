import exerciseNames from '../exerciseNames';
import DataChart from '../DataChart';
import ExerciseAutocomplete from '../components/ExerciseAutocomplete';
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
        <div className="flex-1 flex flex-wrap gap-3">
          {(data.sets || data.input || []).map((weight, idx) => (
            <div key={idx}>
              {isEditing ? (
                <input
                  type="text"
                  value={(editedInputs[exerciseKey]?.sets || editedInputs[exerciseKey]?.input)?.[idx] || ''}
                  onChange={(e) => {
                    const newInputs = { ...editedInputs };
                    if (!newInputs[exerciseKey].sets) newInputs[exerciseKey].sets = [];
                    if (!newInputs[exerciseKey].input) newInputs[exerciseKey].input = []; // Keep for backward compatibility
                    newInputs[exerciseKey].sets[idx] = e.target.value;
                    newInputs[exerciseKey].input[idx] = e.target.value; // Keep for backward compatibility
                    setEditedInputs(newInputs);
                  }}
                  className="p-4 rounded bg-gradient-to-r from-blue-50 to-blue-100 text-xl border min-w-[60px] text-center"
                />
              ) : (
                <div className="p-4 rounded bg-gradient-to-r from-blue-50 to-blue-100 text-xl min-w-[60px] text-center">
                  {weight || '-'}
                </div>
              )}
            </div>
          ))}
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
