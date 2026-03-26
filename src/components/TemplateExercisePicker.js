import { useState, useEffect } from 'react';
import { getDefaultExercises, getExerciseById, getExerciseName, EXERCISES } from '../config/exerciseConfig';
import ExerciseAutocomplete from './ExerciseAutocomplete';
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

// Sortable wrapper for each exercise row
function SortableExerciseRow({ exercise, index, totalCount, muscleGroup, onTyping, onSelect, onRemove, onMoveUp, onMoveDown, getDisplayValue, autoFocus }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.tempId || exercise.category });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-2 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200"
    >
      {/* Drag handle for desktop */}
      <div
        {...attributes}
        {...listeners}
        className="hidden sm:flex flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="7" cy="5" r="1.5"/>
          <circle cx="13" cy="5" r="1.5"/>
          <circle cx="7" cy="10" r="1.5"/>
          <circle cx="13" cy="10" r="1.5"/>
          <circle cx="7" cy="15" r="1.5"/>
          <circle cx="13" cy="15" r="1.5"/>
        </svg>
      </div>

      {/* Arrow buttons for mobile */}
      <div className="flex sm:hidden flex-col gap-0.5">
        <button
          type="button"
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          className={`p-0.5 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Move up"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 3l-5 5h10z"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(index)}
          disabled={index === totalCount - 1}
          className={`p-0.5 rounded ${index === totalCount - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Move down"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 13l5-5H3z"/>
          </svg>
        </button>
      </div>

      <div className="flex-shrink-0 text-gray-500 font-semibold text-sm w-6 sm:w-8">
        #{index + 1}
      </div>
      <div className="flex-1">
        <ExerciseAutocomplete
          value={getDisplayValue(exercise)}
          onChange={(value) => onTyping(index, value)}
          onSelect={(exerciseObj) => onSelect(index, exerciseObj.name, exerciseObj.category)}
          muscleGroup={muscleGroup}
          previousCustomExercises={[]}
          placeholder="Select or type exercise name..."
          className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus={autoFocus}
        />
        {exercise.exerciseId && exercise.isDefault && (
          <div className="mt-1 text-xs text-blue-600 font-semibold">
            ✓ Default Exercise
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="flex-shrink-0 px-2 sm:px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-bold text-lg sm:text-xl"
        title="Remove exercise"
      >
        ×
      </button>
    </div>
  );
}

function TemplateExercisePicker({ muscleGroup, exercises, onChange }) {
  const [localExercises, setLocalExercises] = useState(exercises);
  const [lastAddedIndex, setLastAddedIndex] = useState(null);

  // Set up drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync with parent when exercises prop changes
  useEffect(() => {
    setLocalExercises(exercises);
  }, [exercises]);

  // Clear last added index after a short delay
  useEffect(() => {
    if (lastAddedIndex !== null) {
      const timer = setTimeout(() => setLastAddedIndex(null), 100);
      return () => clearTimeout(timer);
    }
  }, [lastAddedIndex]);

  // Get default exercises for the muscle group
  const defaultExercises = muscleGroup && muscleGroup !== 'custom'
    ? getDefaultExercises(muscleGroup)
    : [];

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = localExercises.findIndex(
        ex => (ex.tempId || ex.category) === active.id
      );
      const newIndex = localExercises.findIndex(
        ex => (ex.tempId || ex.category) === over.id
      );

      const reordered = arrayMove(localExercises, oldIndex, newIndex);
      setLocalExercises(reordered);
      onChange(reordered);
    }
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const reordered = arrayMove(localExercises, index, index - 1);
      setLocalExercises(reordered);
      onChange(reordered);
    }
  };

  const handleMoveDown = (index) => {
    if (index < localExercises.length - 1) {
      const reordered = arrayMove(localExercises, index, index + 1);
      setLocalExercises(reordered);
      onChange(reordered);
    }
  };

  const handleAddExercise = () => {
    const newExercise = {
      category: '', // Will be set when exercise is selected
      exerciseId: '',
      exerciseName: '',
      isCustom: true,
      tempId: `temp_${Date.now()}`, // Temporary ID for React key
    };
    const updated = [...localExercises, newExercise];
    setLocalExercises(updated);
    onChange(updated);
    setLastAddedIndex(updated.length - 1); // Focus on the newly added exercise
  };

  const handleRemoveExercise = (index) => {
    const updated = localExercises.filter((_, i) => i !== index);
    setLocalExercises(updated);
    onChange(updated);
  };

  // Handle typing in the input (just update the display name)
  const handleExerciseTyping = (index, exerciseName) => {
    const updated = [...localExercises];
    updated[index] = {
      ...updated[index],
      exerciseName, // Update display name only
    };
    console.log(`⌨️ Typing exercise ${index}:`, updated[index]);
    setLocalExercises(updated);
    onChange(updated);
  };

  // Handle actual exercise selection/creation (when user selects from dropdown or finishes typing)
  const handleExerciseChange = (index, exerciseName, detectedCategory) => {
    console.log('🔧 handleExerciseChange called:', { index, exerciseName, detectedCategory });
    console.log('🔧 Current exercises state:', localExercises);

    // Convert exercise name to ID if it's a preset exercise
    const exercise = Object.values(EXERCISES).find(
      ex => ex.name === exerciseName
    );

    const exerciseId = exercise ? exercise.id : exerciseName; // Use name as ID for custom exercises

    // IMPORTANT: Use the actual category from the exercise, not a custom timestamp!
    let category;
    if (exercise) {
      // Preset exercise - use its category
      category = exercise.category;
      console.log('✓ Using preset category:', category);
    } else if (detectedCategory) {
      // Custom exercise with detected category
      category = detectedCategory;
      console.log('✓ Using detected category:', category);
    } else {
      // Fallback to custom category (only if we can't detect)
      category = `custom_${Date.now()}`;
      console.log('⚠️ Using fallback custom category:', category);
    }

    const updated = [...localExercises];
    updated[index] = {
      category, // This is the actual category for the workout page
      exerciseId,
      exerciseName, // Store name for display
      detectedCategory: category,
      isDefault: updated[index].isDefault,
      tempId: updated[index].tempId,
    };

    console.log('💾 Saved exercise:', updated[index]);
    console.log('💾 Exercise name being saved:', exerciseName);
    setLocalExercises(updated);
    onChange(updated);
  };

  const handleUseDefaults = () => {
    if (!defaultExercises || defaultExercises.length === 0) {
      alert('No default exercises available for this muscle group');
      return;
    }

    const defaultTemplate = defaultExercises.map((ex, idx) => {
      const exercise = getExerciseById(ex.selected);
      return {
        category: ex.id, // Use the category from defaults
        exerciseId: ex.selected,
        exerciseName: exercise ? exercise.name : ex.selected,
        isDefault: true,
        tempId: `default_${idx}`,
      };
    });

    console.log('📝 Using default exercises:', defaultTemplate);
    setLocalExercises(defaultTemplate);
    onChange(defaultTemplate);
  };

  const getExerciseName = (exerciseId) => {
    if (!exerciseId) return '';
    const exercise = getExerciseById(exerciseId);
    return exercise ? exercise.name : exerciseId;
  };

  const getExerciseDisplayValue = (exercise) => {
    // If exerciseName is explicitly set (even if empty), use it
    if ('exerciseName' in exercise) return exercise.exerciseName || '';
    // Otherwise, look up the name from the ID
    return getExerciseName(exercise.exerciseId) || '';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Exercises</h3>
        <div className="flex gap-2">
          {defaultExercises.length > 0 && (
            <button
              type="button"
              onClick={handleUseDefaults}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold text-sm"
            >
              Use Defaults
            </button>
          )}
          <button
            type="button"
            onClick={handleAddExercise}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            + Add Exercise
          </button>
        </div>
      </div>

      {localExercises.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-3">No exercises added yet</p>
          <button
            type="button"
            onClick={handleAddExercise}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            Add First Exercise
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localExercises.map((ex) => ex.tempId || ex.category)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {localExercises.map((exercise, index) => (
                <SortableExerciseRow
                  key={exercise.tempId || exercise.category}
                  exercise={exercise}
                  index={index}
                  totalCount={localExercises.length}
                  muscleGroup={muscleGroup}
                  onTyping={handleExerciseTyping}
                  onSelect={handleExerciseChange}
                  onRemove={handleRemoveExercise}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  getDisplayValue={getExerciseDisplayValue}
                  autoFocus={index === lastAddedIndex}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Info sections */}
      {defaultExercises.length > 0 && localExercises.length === 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 mb-2">
            <strong>💡 Tip:</strong> Click "Use Defaults" to start with preset exercises for {muscleGroup}
          </p>
          <div className="text-xs text-blue-700">
            Default exercises: {defaultExercises.map(ex => getExerciseName(ex.selected)).join(', ')}
          </div>
        </div>
      )}

      {/* Summary */}
      {localExercises.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800 font-semibold mb-1">
            ✓ {localExercises.length} exercise{localExercises.length !== 1 ? 's' : ''} configured
          </p>
          <div className="text-xs text-green-700">
            {localExercises.map((ex, idx) => getExerciseDisplayValue(ex)).filter(Boolean).join(' • ')}
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplateExercisePicker;
