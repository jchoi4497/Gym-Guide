import TableRow from './TableRow';
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

// Sortable wrapper for TableRow
function SortableTableRow({ exercise, isEditingSets, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag Handle - Only visible when editing sets */}
      {isEditingSets && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing bg-blue-500 text-white w-8 h-12 rounded-lg flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors z-10"
          title="Drag to reorder"
        >
          <span className="text-xl">⋮⋮</span>
        </div>
      )}
      <TableRow {...props} isEditingSets={isEditingSets} />
    </div>
  );
}

function WorkoutTable({
  setRangeLabel,
  muscleGroup,
  numberOfSets,
  exercises,
  onExerciseChange,
  onCellInput,
  exerciseData,
  onRemove,
  onRemoveSet,
  previousCustomExercises = [],
  isEditingSets = false,
  onReorder,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevents accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = exercises.findIndex((ex) => ex.id === active.id);
      const newIndex = exercises.findIndex((ex) => ex.id === over.id);
      const newOrder = arrayMove(exercises, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  return (
    <div className="rounded-2xl shadow-lg bg-sky-50 mb-8 p-4">
      <div className="text-xl font-bold mb-4 py-3 bg-blue-50 rounded-md text-center">
        {setRangeLabel} - {muscleGroup}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exercises.map(ex => ex.id)}
          strategy={verticalListSortingStrategy}
          disabled={!isEditingSets}
        >
          <div className="flex flex-col">
            {exercises.map((exercise) => (
              <SortableTableRow
                key={exercise.id}
                exercise={exercise}
                rowId={exercise.id}
                value={exercise.selected}
                options={exercise.options}
                isCustom={exercise.isCustom}
                numberOfSets={numberOfSets}
                setInputs={exerciseData[exercise.id]?.sets}
                onChange={(newOption, detectedCategory) => onExerciseChange(exercise.id, newOption, detectedCategory)}
                cellInput={(index, inputValue) =>
                  onCellInput(exercise.id, exercise.selected, index, inputValue)
                }
                onRemove={() => onRemove(exercise.id)}
                onRemoveSet={(index) => onRemoveSet(exercise.id, index)}
                previousCustomExercises={previousCustomExercises}
                isEditingSets={isEditingSets}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default WorkoutTable;
