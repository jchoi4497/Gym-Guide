import { useState, useEffect, useRef } from 'react';
import WorkoutTable from './WorkoutTable';
import AddExerciseButton from './AddExerciseButton';
import { getDefaultExercises, getExerciseName } from '../config/exerciseConfig';

function MuscleGroupWorkout({
  muscleGroup,
  numberOfSets,
  setRangeLabel,
  exerciseData,
  onExerciseDataChange,
  onBatchInitializeExercises,
  onRemoveSet,
  onRemoveExercise,
  previousExerciseData,
  previousCustomExercises = [],
  favoriteExercises = [],
  onToggleFavorite,
  isEditingSets,
  onEditingSetsChange,
  expandAll = true,
  onExpandAllChange,
  onReorderExercises, // Handler for when user reorders exercises
  exerciseOrder = [], // Tracked order from parent
}) {

  // Track if we've already initialized to prevent re-initialization
  const hasInitialized = useRef(false);
  // Track the previous muscle group to detect actual changes
  const prevMuscleGroup = useRef(muscleGroup);

  // Initialize exercises based on muscle group
  const [exercises, setExercises] = useState(() => {
    // Check if this is a preset muscle group
    const isPreset = ['chest', 'back', 'legs', 'shoulders'].includes(muscleGroup);

    if (isPreset) {
      return getDefaultExercises(muscleGroup);
    } else {
      // Custom muscle group - start with one empty custom exercise
      return [{
        id: `custom_${Date.now()}`,
        selected: '',
        options: [],
        isCustom: true,
      }];
    }
  });

  // Initialize default exercises in exerciseData on first load ONLY
  useEffect(() => {
    // Only initialize ONCE per muscle group - prevent re-initialization when exercises array changes
    if (!hasInitialized.current && exercises.length > 0 && numberOfSets) {
      // Collect all exercises that need initialization
      const exercisesToInit = [];

      exercises.forEach(exercise => {
        if (exercise.selected && exercise.selected !== 'custom') {
          const existingData = exerciseData[exercise.id];
          if (!existingData || !existingData.exerciseName) {
            exercisesToInit.push({
              categoryKey: exercise.id,
              exerciseName: getExerciseName(exercise.selected),
            });
          }
        }
      });

      // Batch initialize all exercises in a single state update (optimal performance)
      if (exercisesToInit.length > 0 && onBatchInitializeExercises) {
        onBatchInitializeExercises(exercisesToInit);
      }

      hasInitialized.current = true; // Mark as initialized
    }
  }, [exercises.length, numberOfSets, muscleGroup]);

  // Reset initialization flag and rebuild exercises when muscle group ACTUALLY changes (not on first mount)
  useEffect(() => {
    if (prevMuscleGroup.current !== null && prevMuscleGroup.current !== muscleGroup) {
      hasInitialized.current = false;

      // Rebuild exercises array for the new muscle group
      const isPreset = ['chest', 'back', 'legs', 'shoulders'].includes(muscleGroup);

      if (isPreset) {
        setExercises(getDefaultExercises(muscleGroup));
      } else {
        // Custom muscle group - start with one empty custom exercise
        setExercises([{
          id: `custom_${Date.now()}`,
          selected: '',
          options: [],
          isCustom: true,
        }]);
      }
    }
    prevMuscleGroup.current = muscleGroup;
  }, [muscleGroup]);

  // Sync exercises array with exerciseData (for template loading ONLY)
  // Only rebuild when a template is loaded (exerciseData has MORE keys than current exercises)
  useEffect(() => {
    // Filter out cardio and abs exercises - they're handled by OptionalWorkoutSections
    const filterOutCardioAbs = (key) => {
      const lowerKey = key.toLowerCase();
      return !lowerKey.startsWith('cardio') &&
             !lowerKey.startsWith('abs') &&
             !lowerKey.startsWith('custom_cardio') &&
             !lowerKey.startsWith('custom_abs');
    };

    const exerciseDataKeys = Object.keys(exerciseData || {}).filter(filterOutCardioAbs);
    const currentExerciseCount = exercises.length;
    const currentExerciseIds = new Set(exercises.map(ex => ex.id));

    // Only rebuild if exerciseData has MORE exercises than current (template loaded)
    // OR if we have no exercises yet (initial load)
    if (currentExerciseCount === 0) {
      if (exerciseDataKeys.length > 0) {
        // Use exerciseOrder from parent if available, otherwise use keys as-is
        const orderedKeys = exerciseOrder && exerciseOrder.length > 0
          ? exerciseOrder.filter(key => exerciseDataKeys.includes(key))
          : exerciseDataKeys;

        // Build exercises array from exerciseData (template loading)
        const exercisesFromData = orderedKeys.map((categoryId) => ({
          id: categoryId,
          selected: exerciseData[categoryId]?.exerciseName || '',
          options: [],
          isCustom: true,
        }));

        setExercises(exercisesFromData);
      } else {
        // No exercise data - load defaults
        setExercises(getDefaultExercises(muscleGroup));
      }
    } else if (exerciseDataKeys.length > currentExerciseCount) {
      // Only rebuild if there are NEW keys in exerciseData that aren't in current exercises
      // This indicates a template was loaded, not that user added/removed exercises
      const newKeys = exerciseDataKeys.filter(key => !currentExerciseIds.has(key));
      const hasSignificantNewData = newKeys.length > 1 || (newKeys.length === 1 && exerciseData[newKeys[0]]?.exerciseName);

      if (hasSignificantNewData) {
        // Use exerciseOrder from parent if available, otherwise use keys as-is
        const orderedKeys = exerciseOrder && exerciseOrder.length > 0
          ? exerciseOrder.filter(key => exerciseDataKeys.includes(key))
          : exerciseDataKeys;

        // Template loaded - rebuild from exerciseData
        const exercisesFromData = orderedKeys.map((categoryId) => ({
          id: categoryId,
          selected: exerciseData[categoryId]?.exerciseName || '',
          options: [],
          isCustom: true,
        }));

        setExercises(exercisesFromData);
      }
    }
    // Otherwise skip rebuild - user is just typing set data or managing exercises manually
  }, [muscleGroup, exerciseData, exerciseOrder]);

  // Add a custom exercise row
  const addCustomExercise = () => {
    const customId = `custom_${Date.now()}`;
    setExercises([
      ...exercises,
      {
        id: customId,
        selected: '',
        options: [],
        isCustom: true,
      },
    ]);
    // Initialize in exerciseData with empty value
    onExerciseDataChange(customId, '', -1, null, null);
  };

  // Remove an exercise row
  const removeExercise = (rowId) => {
    setExercises(exercises.filter((exercise) => exercise.id !== rowId));
    // Also clean up the exerciseData for this exercise
    if (onRemoveExercise) {
      onRemoveExercise(rowId);
    }
  };

  // Handle exercise selection change
  const handleExerciseChange = (rowId, newExerciseValue, detectedCategory) => {
    const updatedExercises = exercises.map((ex) =>
      ex.id === rowId ? { ...ex, selected: newExerciseValue } : ex
    );

    setExercises(updatedExercises);
    onExerciseDataChange(rowId, newExerciseValue, -1, null, detectedCategory);
  };

  // Handle set data input change
  const handleInputChange = (rowId, selected, index, inputValue) => {
    onExerciseDataChange(rowId, selected, index, inputValue, null);
  };

  // Handle reordering exercises
  const handleReorder = (newOrderedExercises) => {
    setExercises(newOrderedExercises);

    // Notify parent of the new order (extract IDs)
    if (onReorderExercises) {
      const newOrder = newOrderedExercises.map(ex => ex.id);
      onReorderExercises(newOrder);
    }
  };

  return (
    <div>
      {/* Edit Sets Toggle Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => onEditingSetsChange(!isEditingSets)}
          className={`px-4 py-2 rounded-lg text-white font-semibold transition-all active:scale-95 shadow-md ${
            isEditingSets
              ? 'bg-orange-500 hover:bg-orange-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isEditingSets ? '✓ Done Editing Sets' : '✎ Edit Sets'}
        </button>
      </div>

      <WorkoutTable
        setRangeLabel={setRangeLabel}
        muscleGroup={muscleGroup}
        numberOfSets={numberOfSets}
        exercises={exercises}
        onExerciseChange={handleExerciseChange}
        onCellInput={handleInputChange}
        exerciseData={exerciseData}
        onRemove={removeExercise}
        onRemoveSet={onRemoveSet}
        previousCustomExercises={previousCustomExercises}
        isEditingSets={isEditingSets}
        onReorder={handleReorder}
        favoriteExercises={favoriteExercises}
        onToggleFavorite={onToggleFavorite}
        expandAll={expandAll}
        onExpandAllChange={onExpandAllChange}
      />
      <AddExerciseButton onClick={addCustomExercise} />
    </div>
  );
}

export default MuscleGroupWorkout;
