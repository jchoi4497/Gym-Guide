import { useState } from 'react';
import WorkoutTable from '../WorkoutTable';
import AddExerciseButton from '../AddExerciseButton';

function ChestWorkout({ target, reps, label, inputs, onInput, previousInputs }) {
  const inclineExerciseOptions = [
    { label: 'Dumbbell Incline Press', value: 'dip' },
    { label: 'Machine Incline Press', value: 'mip' },
    { label: 'Smith Machine Incline Press', value: 'smip' },
    { label: 'Barbell Incline Press', value: 'bip' },
  ];

  const chestPressExerciseOptions = [
    { label: 'Dumbbell Press', value: 'dp' },
    { label: 'Machine Press', value: 'mp' },
    { label: 'Smith Machine Press', value: 'smp' },
    { label: 'Barbell Press', value: 'bp' },
  ];

  const chestFlyExerciseOptions = [
    { label: 'Chest Fly Machine', value: 'cfm' },
    { label: 'Cable Flys', value: 'cf' },
    { label: 'Dumbbell Flys', value: 'df' },
  ];

  const tricepExerciseOptions = [
    { label: 'Straight Bar Cable Push Downs', value: 'sbcpd' },
    { label: 'Rope Pull Downs', value: 'rpd' },
    { label: '1 Arm Cable Pull Downs', value: 'oacpd' },
    { label: 'Overhead Bar Cable Extensions', value: 'obce' },
    { label: 'Overhead Dumbbell Extensions', value: 'ode' },
    { label: 'Dips', value: 'd' },
  ];

  const tricepExerciseOptionsTwo = [
    { label: '1 Arm Cable Pull Downs', value: 'oacpdt' },
    { label: 'Rope Pull Downs', value: 'rpdt' },
    { label: 'Straight Bar Cable Push Downs', value: 'sbcpdt' },
    { label: 'Overhead Bar Cable Extensions', value: 'obcet' },
    { label: 'Overhead Dumbbell Extensions', value: 'odet' },
    { label: 'Dips', value: 'dt' },
  ];

  const [exercises, setExercises] = useState([
    { id: 'incline', selected: 'dip', options: inclineExerciseOptions },
    { id: 'chestpress', selected: 'mp', options: chestPressExerciseOptions },
    { id: 'fly', selected: 'cfm', options: chestFlyExerciseOptions },
    { id: 'tri', selected: 'sbcpd', options: tricepExerciseOptions },
    { id: 'tri2', selected: 'oacpdt', options: tricepExerciseOptionsTwo },
  ]);

  // Logic to add a new custom row
  const addCustomExercise = () => {
    const customId = `custom_${Date.now()}`; // Unique ID for Firebase
    setExercises([
      ...exercises,
      {
        id: customId,
        selected: '', // Initially empty name
        options: [],
        isCustom: true,
      },
    ]);
  };

  const removeExercise = (rowId) => {
    setExercises(exercises.filter((exercise) => exercise.id !== rowId));
    // Optional: Clean up the 'inputs' state in the parent if you want
  };

  const handleExerciseChange = (rowId, newExerciseValue) => {
    const name = newExerciseValue; // Just update the state, no alerts here

    const updatedExercises = exercises.map((ex) => {
      if (ex.id === rowId) {
        return { ...ex, selected: name };
      }
      return ex;
    });

    setExercises(updatedExercises);
    onInput(rowId, name, -1);
  };

  const handleInputChange = (rowId, selected, index, inputValue) => {
    onInput(rowId, selected, index, inputValue);
  };

  return (
    <div>
      <WorkoutTable
        label={label}
        target={target}
        reps={reps}
        exercises={exercises}
        onExerciseChange={handleExerciseChange}
        onCellInput={handleInputChange}
        inputs={inputs}
        onRemove={removeExercise}
      />
      <AddExerciseButton onClick={addCustomExercise} />
    </div>
  );
}

export default ChestWorkout;
