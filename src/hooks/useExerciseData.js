import { useState } from 'react';

/**
 * Custom hook to manage exercise data state and handlers
 * Handles exercise changes, set additions/removals, and data updates
 */
export function useExerciseData(actualNumberOfSets) {
  const [exerciseData, setExerciseData] = useState({});

  // Batch initialize multiple exercises at once (optimal for initial load)
  const batchInitializeExercises = (exercisesToInit) => {
    setExerciseData(prevExerciseData => {
      const updatedExerciseData = { ...prevExerciseData };

      exercisesToInit.forEach(({ categoryKey, exerciseName }) => {
        if (!updatedExerciseData[categoryKey] || !updatedExerciseData[categoryKey].exerciseName) {
          const setsArray = new Array(actualNumberOfSets).fill('');
          updatedExerciseData[categoryKey] = {
            sets: setsArray,
            exerciseName: exerciseName,
          };
        }
      });

      return updatedExerciseData;
    });
  };

  // Workout Selection: Weight x Reps input
  const handleExerciseDataChange = (categoryKey, exerciseName, setIndex, setInput, detectedCategory) => {
    // Use functional setState to ensure we always get the latest state
    setExerciseData(prevExerciseData => {
      const updatedExerciseData = { ...prevExerciseData };

      // Check if this is a cardio or abs exercise (they don't use actualNumberOfSets)
      const isCardioOrAbs = categoryKey.startsWith('cardio') || categoryKey.startsWith('custom_cardio') ||
                            categoryKey.startsWith('abs') || categoryKey.startsWith('custom_abs');

      if (!updatedExerciseData[categoryKey]) {
        // For cardio/abs, start with empty array (will grow dynamically)
        // For regular exercises, use actualNumberOfSets
        const setsArray = isCardioOrAbs ? [] : new Array(actualNumberOfSets).fill('');
        updatedExerciseData[categoryKey] = {
          sets: setsArray,
          exerciseName: exerciseName,
        };
      }

      if (setIndex === -1) {
        // -1 means changing the exercise selection
        updatedExerciseData[categoryKey].exerciseName = exerciseName;
        // Store detected category if provided
        if (detectedCategory) {
          updatedExerciseData[categoryKey].detectedCategory = detectedCategory;
        }
        // Ensure sets array exists and has correct length
        if (!updatedExerciseData[categoryKey].sets || updatedExerciseData[categoryKey].sets.length === 0) {
          // For cardio/abs, start empty. For regular exercises, use actualNumberOfSets
          updatedExerciseData[categoryKey].sets = isCardioOrAbs ? [] : new Array(actualNumberOfSets).fill('');
        }
      } else {
        // Auto-expand array if user is adding a set beyond current length
        const currentSets = updatedExerciseData[categoryKey].sets;
        while (currentSets.length <= setIndex) {
          currentSets.push('');
        }
        // Update the specific set
        updatedExerciseData[categoryKey].sets[setIndex] = setInput;
      }

      return updatedExerciseData;
    });
  };

  // Remove a specific set from an exercise
  const handleRemoveSet = (categoryKey, setIndex) => {
    setExerciseData(prevExerciseData => {
      const updatedExerciseData = { ...prevExerciseData };

      // Initialize if doesn't exist yet
      if (!updatedExerciseData[categoryKey]) {
        const setsArray = new Array(actualNumberOfSets).fill('');
        updatedExerciseData[categoryKey] = {
          sets: setsArray,
          exerciseName: '',
        };
      }

      // Now remove the set
      updatedExerciseData[categoryKey].sets = updatedExerciseData[categoryKey].sets.filter((_, i) => i !== setIndex);
      return updatedExerciseData;
    });
  };

  return {
    exerciseData,
    setExerciseData,
    batchInitializeExercises,
    handleExerciseDataChange,
    handleRemoveSet,
  };
}
