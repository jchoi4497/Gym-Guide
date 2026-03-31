import { useState } from 'react';
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
function SortableTableRow({ exercise, isEditingSets, onMoveUp, onMoveDown, isFirst, isLast, expandAll, ...props }) {
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
      {/* Reorder Controls - Only visible when editing sets */}
      {isEditingSets && (
        <>
          {/* Arrow Buttons (Mobile - sm and below) */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 sm:hidden z-10">
            <button
              onClick={() => onMoveUp(exercise.id)}
              disabled={isFirst}
              className={`w-7 h-7 rounded flex items-center justify-center shadow-md transition-all ${
                isFirst
                  ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-90'
              }`}
              title="Move up"
            >
              ↑
            </button>
            <button
              onClick={() => onMoveDown(exercise.id)}
              disabled={isLast}
              className={`w-7 h-7 rounded flex items-center justify-center shadow-md transition-all ${
                isLast
                  ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-90'
              }`}
              title="Move down"
            >
              ↓
            </button>
          </div>

          {/* Drag Handle (Desktop - sm and above) */}
          <div
            {...attributes}
            {...listeners}
            className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing bg-blue-500 text-white w-8 h-12 rounded-lg items-center justify-center shadow-lg hover:bg-blue-600 transition-colors z-10"
            title="Drag to reorder"
          >
            <span className="text-xl">⋮⋮</span>
          </div>
        </>
      )}
      <TableRow {...props} isEditingSets={isEditingSets} expandAll={expandAll} />
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
  favoriteExercises = [],
  onToggleFavorite,
}) {
  const [expandAll, setExpandAll] = useState(false);

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

  // Move item up one position
  const moveUp = (id) => {
    const currentIndex = exercises.findIndex((ex) => ex.id === id);
    if (currentIndex > 0) {
      const newOrder = arrayMove(exercises, currentIndex, currentIndex - 1);
      onReorder(newOrder);
    }
  };

  // Move item down one position
  const moveDown = (id) => {
    const currentIndex = exercises.findIndex((ex) => ex.id === id);
    if (currentIndex < exercises.length - 1) {
      const newOrder = arrayMove(exercises, currentIndex, currentIndex + 1);
      onReorder(newOrder);
    }
  };

  return (
    <div className="rounded-2xl shadow-lg bg-sky-50 mb-8 p-4">
      <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-md">
        <div className="text-xl font-bold">
          {setRangeLabel} - {muscleGroup}
        </div>
        <button
          onClick={() => setExpandAll(!expandAll)}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
        >
          {expandAll ? '▼ Collapse All' : '▶ Expand All'}
        </button>
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
            {exercises.map((exercise, index) => (
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
                favoriteExercises={favoriteExercises}
                expandAll={expandAll}
                onToggleFavorite={onToggleFavorite}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                isFirst={index === 0}
                isLast={index === exercises.length - 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default WorkoutTable;
