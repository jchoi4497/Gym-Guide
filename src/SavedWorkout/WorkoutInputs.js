import { useState, useEffect } from 'react';
import exerciseNames from '../exerciseNames';
import DataChart from '../DataChart';
import ExerciseAutocomplete from '../components/ExerciseAutocomplete';
import { getPlaceholderForExercise, getExerciseById, getExerciseIdByName, EXERCISE_CATEGORIES, MUSCLE_GROUPS } from '../config/exerciseConfig';
import WeightRepsPicker from '../components/WeightRepsPicker';
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

// Field templates for different cardio exercise types
const CARDIO_FIELD_TEMPLATES = {
  treadmill: ['Incline', 'Time (min)', 'Speed (mph)'],
  bike: ['Resistance', 'Time (min)', 'Speed (mph)'],
  elliptical: ['Resistance', 'Time (min)'],
  stairmaster: ['Level', 'Time (min)'],
  running: ['Distance (mi)', 'Time (min)', 'Pace (min/mi)'],
  // Default for custom cardio
  default: ['Metric 1', 'Metric 2', 'Metric 3'],
};

// Helper function to get fields for a cardio exercise
const getCardioFields = (exerciseId) => {
  return CARDIO_FIELD_TEMPLATES[exerciseId] || CARDIO_FIELD_TEMPLATES.default;
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
  expandAll,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
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

  // Collapse/expand state - default expanded
  const [isExpanded, setIsExpanded] = useState(true);

  // Sync with expandAll prop
  useEffect(() => {
    if (expandAll !== undefined) {
      setIsExpanded(expandAll);
    }
  }, [expandAll]);

  // Picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingSetIndex, setEditingSetIndex] = useState(null);
  const [initialField, setInitialField] = useState('weight'); // Track which field was clicked

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's sm breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Open picker for a specific set and field
  const handleOpenPicker = (setIndex, field = 'weight') => {
    setEditingSetIndex(setIndex);
    setInitialField(field);
    setPickerOpen(true);
  };

  // Save values from picker
  const handlePickerSave = (weight, reps) => {
    if (editingSetIndex !== null) {
      const combined = combineSet(weight, reps);
      const newInputs = { ...editedInputs };
      if (!newInputs[exerciseKey].sets) newInputs[exerciseKey].sets = [];
      if (!newInputs[exerciseKey].input) newInputs[exerciseKey].input = [];
      newInputs[exerciseKey].sets[editingSetIndex] = combined;
      newInputs[exerciseKey].input[editingSetIndex] = combined;
      setEditedInputs(newInputs);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-8 p-4 bg-sky-50 rounded-2xl shadow-lg relative"
    >
      {/* Reorder Controls - Only visible when editing */}
      {isEditing && (
        <>
          {/* Arrow Buttons (Mobile - sm and below) - Positioned inside the card on the left */}
          <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 sm:hidden z-20">
            <button
              onClick={() => onMoveUp && onMoveUp()}
              disabled={isFirst}
              className={`w-6 h-6 rounded flex items-center justify-center shadow-sm transition-all ${
                isFirst
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-gray-400 hover:bg-gray-500 active:scale-90'
              }`}
              title="Move up"
            >
              <svg className={`w-3 h-3 ${isFirst ? 'text-gray-400' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={() => onMoveDown && onMoveDown()}
              disabled={isLast}
              className={`w-6 h-6 rounded flex items-center justify-center shadow-sm transition-all ${
                isLast
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-gray-400 hover:bg-gray-500 active:scale-90'
              }`}
              title="Move down"
            >
              <svg className={`w-3 h-3 ${isLast ? 'text-gray-400' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
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

      {/* DELETE BUTTON: Only shows when editing */}
      {isEditing && (
        <button
          onClick={() => onRemove(exerciseKey)}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 z-20 cursor-pointer"
        >
          ✕
        </button>
      )}

      {/* Header - Always Visible */}
      <div className="flex items-center justify-between bg-sky-50 transition-colors rounded-lg pr-2 -m-4 p-4 mb-4">
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className="text-2xl font-bold flex items-center gap-4 flex-1 min-w-0">
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
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-sky-100 transition-colors flex-shrink-0 z-10"
          type="button"
        >
          <span className="text-gray-600 font-bold">{isExpanded ? '▼' : '▶'}</span>
        </button>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
      <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 sm:space-y-0">
        <div className="flex-1 flex flex-col gap-3">
          {/* Set Inputs */}
          <div className="flex flex-wrap gap-3">
            {/* Determine exercise type once for all sets */}
            {(() => {
              const exerciseId = data.selection || getExerciseIdByName(data.exerciseName) || data.exerciseName;
              const exercise = getExerciseById(exerciseId);
              const placeholder = getPlaceholderForExercise(exerciseId);

              // Better cardio detection using category/muscleGroup
              const isCardio = exercise?.category === EXERCISE_CATEGORIES.CARDIO ||
                               exercise?.muscleGroup === MUSCLE_GROUPS.CARDIO ||
                               exerciseKey.includes('cardio');

              const isBodyweight = exercise?.metricType === 'bodyweight' || placeholder === 'Reps';
              const isTimed = exercise?.metricType === 'timed' || placeholder.includes('Duration') || placeholder.includes('sec');
              const showWeightInput = !isBodyweight && !isTimed && !isCardio;

              // For cardio exercises, show labeled input fields
              if (isCardio) {
                const cardioFields = getCardioFields(exerciseId);
                const sets = data.sets || data.input || [];

                return cardioFields.map((label, idx) => {
                  const value = isEditing
                    ? ((editedInputs[exerciseKey]?.sets || editedInputs[exerciseKey]?.input)?.[idx] || '')
                    : (sets[idx] || '');

                  return (
                    <div key={idx}>
                      <input
                        type="text"
                        value={value}
                        onChange={isEditing ? (e) => {
                          const newInputs = { ...editedInputs };
                          if (!newInputs[exerciseKey].sets) newInputs[exerciseKey].sets = [];
                          if (!newInputs[exerciseKey].input) newInputs[exerciseKey].input = [];
                          newInputs[exerciseKey].sets[idx] = e.target.value;
                          newInputs[exerciseKey].input[idx] = e.target.value;
                          setEditedInputs(newInputs);
                        } : undefined}
                        placeholder={label}
                        readOnly={!isEditing}
                        className={`px-3 py-2 w-full rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 placeholder-gray-400 text-gray-900 mb-2 sm:mb-0 ${isEditing ? '' : 'cursor-default'}`}
                      />
                    </div>
                  );
                });
              }

              // Regular sets display
              const sets = data.sets || data.input || [];
              const setsToDisplay = sets.length > 0 ? sets : Array(4).fill('');

              return setsToDisplay.map((setData, idx) => {
                const currentSet = parseSet((editedInputs[exerciseKey]?.sets || editedInputs[exerciseKey]?.input)?.[idx] || setData || '');

                return (
                  <div key={idx}>
                  {isEditing ? (
                    isMobile ? (
                      // MOBILE: Buttons that open picker modal
                      <div className="flex items-center gap-1">
                        {showWeightInput && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenPicker(idx, 'weight')}
                              className="px-2 py-3 w-20 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-lg hover:bg-blue-200 active:scale-95"
                            >
                              {currentSet.weight || <span className="text-gray-400">lbs</span>}
                            </button>
                            <span className="text-gray-500 font-bold">×</span>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenPicker(idx, 'reps')}
                          className={`px-2 py-3 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-lg hover:bg-blue-200 active:scale-95 ${showWeightInput ? 'w-16' : 'w-20'}`}
                        >
                          {currentSet.reps || <span className="text-gray-400">{isCardio ? placeholder : (isTimed ? "sec" : "reps")}</span>}
                        </button>
                      </div>
                    ) : (
                      // DESKTOP: Regular text inputs
                      <div className="flex items-center gap-1">
                        {showWeightInput && (
                          <>
                            <input
                              type="number"
                              step="0.5"
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
                              placeholder="lbs"
                              className="px-2 py-3 w-20 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-lg"
                            />
                            <span className="text-gray-500 font-bold">×</span>
                          </>
                        )}
                        <input
                          type="number"
                          step={isCardio ? "0.1" : "1"}
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
                          placeholder={isCardio ? placeholder : (isTimed ? "sec" : "reps")}
                          className={`px-2 py-3 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-lg ${showWeightInput ? 'w-16' : 'w-20'}`}
                        />
                      </div>
                    )
                  ) : (
                    // NON-EDIT MODE: Regular display
                    <div className="p-4 rounded bg-gradient-to-r from-blue-50 to-blue-100 text-xl min-w-[60px] text-center">
                      {setData || '-'}
                    </div>
                  )}
                </div>
              );
            });
            })()}
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
      )}

      {/* Wheel Picker Modal */}
      {isEditing && (() => {
        // Get current set being edited
        const currentSet = editingSetIndex !== null ? parseSet((editedInputs[exerciseKey]?.sets || editedInputs[exerciseKey]?.input)?.[editingSetIndex] || '') : { weight: '', reps: '' };

        // Determine exercise type for picker
        // Try selection first (new data), then reverse lookup from name (old data), then fallback to name
        const exerciseId = data.selection || getExerciseIdByName(data.exerciseName) || data.exerciseName;
        const exercise = getExerciseById(exerciseId);
        const placeholder = getPlaceholderForExercise(exerciseId);

        const isBodyweight = exercise?.metricType === 'bodyweight' || placeholder === 'Reps';
        const isTimed = exercise?.metricType === 'timed' || placeholder.includes('Duration') || placeholder.includes('sec');
        const isCardio = placeholder.includes('min') || placeholder.includes('mi');

        let exerciseType = 'weight';
        if (isCardio) exerciseType = 'cardio';
        else if (isTimed) exerciseType = 'timed';
        else if (isBodyweight) exerciseType = 'bodyweight';

        return (
          <WeightRepsPicker
            isOpen={pickerOpen}
            onClose={() => setPickerOpen(false)}
            weight={currentSet.weight}
            reps={currentSet.reps}
            onSave={handlePickerSave}
            exerciseType={exerciseType}
            initialField={initialField}
          />
        );
      })()}
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
  expandAll = true, // Controlled by parent
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

  // Mobile arrow button handlers
  const handleMoveUp = (exerciseKey) => {
    const currentIndex = order.indexOf(exerciseKey);
    if (currentIndex > 0) {
      const newOrder = arrayMove(order, currentIndex, currentIndex - 1);
      onReorder(newOrder);
    }
  };

  const handleMoveDown = (exerciseKey) => {
    const currentIndex = order.indexOf(exerciseKey);
    if (currentIndex < order.length - 1) {
      const newOrder = arrayMove(order, currentIndex, currentIndex + 1);
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
          {order.map((key, index) => {
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
                expandAll={expandAll}
                onMoveUp={() => handleMoveUp(key)}
                onMoveDown={() => handleMoveDown(key)}
                isFirst={index === 0}
                isLast={index === order.length - 1}
              />
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default WorkoutInputs;
