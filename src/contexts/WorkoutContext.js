import { createContext, useContext, useState, useCallback } from 'react';

const WorkoutContext = createContext(null);

export function WorkoutProvider({ children, initialData = {} }) {
  // Exercise data
  const [exerciseData, setExerciseData] = useState(initialData.exerciseData || {});

  // Workout configuration
  const [numberOfSets, setNumberOfSets] = useState(initialData.numberOfSets || 4);
  const [muscleGroup, setMuscleGroup] = useState(initialData.muscleGroup || '');
  const [setRangeLabel, setSetRangeLabel] = useState(initialData.setRangeLabel || '4 sets');
  const [templateId, setTemplateId] = useState(initialData.templateId || null);

  // Favorites and previous data
  const [favoriteExercises, setFavoriteExercises] = useState(initialData.favoriteExercises || []);
  const [previousWorkoutData, setPreviousWorkoutData] = useState(initialData.previousWorkoutData || null);
  const [previousCustomExercises, setPreviousCustomExercises] = useState(initialData.previousCustomExercises || []);

  // UI state
  const [isEditingSets, setIsEditingSets] = useState(false);
  const [expandAll, setExpandAll] = useState(false);

  // Exercise ordering
  const [mainExerciseOrder, setMainExerciseOrder] = useState(initialData.mainExerciseOrder || []);

  // Callback for adding custom exercises (set by MuscleGroupWorkout)
  const [addCustomExercise, setAddCustomExercise] = useState(() => () => {
    console.warn('addCustomExercise not yet registered');
  });

  // Handle exercise data changes
  const handleExerciseDataChange = useCallback((categoryKey, exerciseName, setIndex, setInput, detectedCategory) => {
    setExerciseData(prevExerciseData => {
      const updatedExerciseData = { ...prevExerciseData };

      if (!updatedExerciseData[categoryKey]) {
        const safeSetsCount = numberOfSets && numberOfSets > 0 ? numberOfSets : 4;
        updatedExerciseData[categoryKey] = {
          sets: new Array(safeSetsCount).fill(''),
          exerciseName: exerciseName,
        };

        setMainExerciseOrder(prev => [...prev, categoryKey]);
      }

      if (setIndex === -1) {
        updatedExerciseData[categoryKey].exerciseName = exerciseName;
        if (detectedCategory) {
          updatedExerciseData[categoryKey].detectedCategory = detectedCategory;
        }
        if (!updatedExerciseData[categoryKey].sets || updatedExerciseData[categoryKey].sets.length === 0) {
          const safeSetsCount = numberOfSets && numberOfSets > 0 ? numberOfSets : 4;
          updatedExerciseData[categoryKey].sets = new Array(safeSetsCount).fill('');
        }
      } else {
        const currentSets = updatedExerciseData[categoryKey].sets;
        while (currentSets.length <= setIndex) {
          currentSets.push('');
        }
        updatedExerciseData[categoryKey].sets[setIndex] = setInput;
      }

      return updatedExerciseData;
    });
  }, [numberOfSets]);

  // Batch initialize exercises
  const batchInitializeExercises = useCallback((exercisesToInit) => {
    if (!numberOfSets || numberOfSets < 1) {
      console.warn('[batchInitializeExercises] Skipping - invalid numberOfSets:', numberOfSets);
      return;
    }

    setExerciseData(prevExerciseData => {
      const updatedExerciseData = { ...prevExerciseData };

      exercisesToInit.forEach(({ categoryKey, exerciseName }) => {
        if (!updatedExerciseData[categoryKey] || !updatedExerciseData[categoryKey].exerciseName) {
          const setsArray = new Array(numberOfSets).fill('');
          updatedExerciseData[categoryKey] = {
            sets: setsArray,
            exerciseName: exerciseName,
          };
        }
      });

      return updatedExerciseData;
    });

    const newKeys = exercisesToInit.map(ex => ex.categoryKey);
    setMainExerciseOrder(prev => {
      const keysToAdd = newKeys.filter(key => !prev.includes(key));
      return [...prev, ...keysToAdd];
    });
  }, [numberOfSets]);

  // Remove an exercise
  const handleRemoveExercise = useCallback((categoryKey, onDelete) => {
    const updatedExerciseData = { ...exerciseData };
    delete updatedExerciseData[categoryKey];
    setExerciseData(updatedExerciseData);

    const updatedOrder = mainExerciseOrder.filter(key => key !== categoryKey);
    setMainExerciseOrder(updatedOrder);

    // Call optional callback for additional cleanup (e.g., Firebase save)
    if (onDelete) {
      onDelete(updatedExerciseData, updatedOrder);
    }
  }, [exerciseData, mainExerciseOrder]);

  // Remove a specific set
  const handleRemoveSet = useCallback((categoryKey, setIndex) => {
    const updatedExerciseData = { ...exerciseData };

    if (!updatedExerciseData[categoryKey]) {
      const setsArray = new Array(numberOfSets).fill('');
      updatedExerciseData[categoryKey] = {
        sets: setsArray,
        exerciseName: '',
      };
    }

    updatedExerciseData[categoryKey].sets = updatedExerciseData[categoryKey].sets.filter((_, i) => i !== setIndex);
    setExerciseData(updatedExerciseData);
  }, [exerciseData, numberOfSets]);

  // Reorder exercises
  const handleReorderExercises = useCallback((newOrder) => {
    setMainExerciseOrder(newOrder);
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (exerciseId, onSave) => {
    const newFavorites = favoriteExercises.includes(exerciseId)
      ? favoriteExercises.filter(id => id !== exerciseId)
      : [...favoriteExercises, exerciseId];

    setFavoriteExercises(newFavorites);

    // Call optional callback for persistence (e.g., Firebase save)
    if (onSave) {
      await onSave(newFavorites);
    }
  }, [favoriteExercises]);


  // Update all state at once (useful for loading from Firebase)
  const updateWorkoutState = useCallback((updates) => {
    if (updates.exerciseData !== undefined) setExerciseData(updates.exerciseData);
    if (updates.numberOfSets !== undefined) setNumberOfSets(updates.numberOfSets);
    if (updates.muscleGroup !== undefined) setMuscleGroup(updates.muscleGroup);
    if (updates.setRangeLabel !== undefined) setSetRangeLabel(updates.setRangeLabel);
    if (updates.templateId !== undefined) setTemplateId(updates.templateId);
    if (updates.favoriteExercises !== undefined) setFavoriteExercises(updates.favoriteExercises);
    if (updates.previousWorkoutData !== undefined) setPreviousWorkoutData(updates.previousWorkoutData);
    if (updates.previousCustomExercises !== undefined) setPreviousCustomExercises(updates.previousCustomExercises);
    if (updates.mainExerciseOrder !== undefined) setMainExerciseOrder(updates.mainExerciseOrder);
  }, []);

  const value = {
    // State
    exerciseData,
    setExerciseData,
    numberOfSets,
    setNumberOfSets,
    muscleGroup,
    setMuscleGroup,
    setRangeLabel,
    setSetRangeLabel,
    templateId,
    setTemplateId,
    favoriteExercises,
    setFavoriteExercises,
    previousWorkoutData,
    setPreviousWorkoutData,
    previousCustomExercises,
    setPreviousCustomExercises,
    isEditingSets,
    setIsEditingSets,
    expandAll,
    setExpandAll,
    mainExerciseOrder,
    setMainExerciseOrder,
    addCustomExercise,
    setAddCustomExercise,

    // Functions
    handleExerciseDataChange,
    batchInitializeExercises,
    handleRemoveExercise,
    handleRemoveSet,
    handleReorderExercises,
    toggleFavorite,
    updateWorkoutState,
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
