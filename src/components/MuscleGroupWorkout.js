import { useState, useEffect } from 'react';
import WorkoutTable from '../WorkoutTable';
import AddExerciseButton from '../AddExerciseButton';
import { getDefaultExercises } from '../config/exerciseConfig';

function MuscleGroupWorkout({
  muscleGroup,
  numberOfSets,
  setRangeLabel,
  exerciseData,
  onExerciseDataChange,
  onRemoveSet,
  previousExerciseData,
  previousCustomExercises = [],
  favoriteExercises = [],
  onToggleFavorite
}) {
  // State to track if user is editing sets (add/remove functionality)
  const [isEditingSets, setIsEditingSets] = useState(false);

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

  // Reset exercises when muscle group changes (but preserve template exercises)
  useEffect(() => {
    // Only reset if we don't have existing exercise data (i.e., not loading from template)
    const hasExerciseData = exerciseData && Object.keys(exerciseData).length > 0;

    if (!hasExerciseData) {
      setExercises(getDefaultExercises(muscleGroup));
    }
  }, [muscleGroup]);

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
  };

  // Remove an exercise row
  const removeExercise = (rowId) => {
    setExercises(exercises.filter((exercise) => exercise.id !== rowId));
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
  };

  return (
    <div>
      {/* Edit Sets Toggle Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsEditingSets(!isEditingSets)}
          className={`px-4 py-2 rounded-lg text-white font-semibold shadow-md transition-all active:scale-95 ${
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
      />
      <AddExerciseButton onClick={addCustomExercise} />
    </div>
  );
}

export default MuscleGroupWorkout;
