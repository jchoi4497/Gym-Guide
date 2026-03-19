import { useState } from 'react';
import WorkoutTable from '../WorkoutTable';
import AddExerciseButton from '../AddExerciseButton';
import OptionalWorkoutSections from './OptionalWorkoutSections';
import { getDefaultExercises } from '../config/exerciseConfig';

function MuscleGroupWorkout({
  muscleGroup,
  numberOfSets,
  setRangeLabel,
  exerciseData,
  onExerciseDataChange,
  previousExerciseData,
  previousCustomExercises = []
}) {
  // Initialize exercises based on muscle group
  const [exercises, setExercises] = useState(() =>
    getDefaultExercises(muscleGroup)
  );

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
  const handleExerciseChange = (rowId, newExerciseValue) => {
    const updatedExercises = exercises.map((ex) =>
      ex.id === rowId ? { ...ex, selected: newExerciseValue } : ex
    );

    setExercises(updatedExercises);
    onExerciseDataChange(rowId, newExerciseValue, -1);
  };

  // Handle set data input change
  const handleInputChange = (rowId, selected, index, inputValue) => {
    onExerciseDataChange(rowId, selected, index, inputValue);
  };

  return (
    <div>
      <WorkoutTable
        setRangeLabel={setRangeLabel}
        muscleGroup={muscleGroup}
        numberOfSets={numberOfSets}
        exercises={exercises}
        onExerciseChange={handleExerciseChange}
        onCellInput={handleInputChange}
        exerciseData={exerciseData}
        onRemove={removeExercise}
        previousCustomExercises={previousCustomExercises}
      />
      <AddExerciseButton onClick={addCustomExercise} />

      {/* Optional Cardio & Abs Sections */}
      <OptionalWorkoutSections
        numberOfSets={numberOfSets}
        setRangeLabel={setRangeLabel}
        exerciseData={exerciseData}
        onExerciseDataChange={onExerciseDataChange}
      />
    </div>
  );
}

export default MuscleGroupWorkout;
