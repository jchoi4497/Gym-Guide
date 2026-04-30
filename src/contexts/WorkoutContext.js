import { createContext, useContext, useState, useCallback } from 'react';

const WorkoutContext = createContext(null);

export function WorkoutProvider({ children, initialData = {} }) {
  // Exercise data
  const [exerciseData, setExerciseData] = useState(initialData.exerciseData || {});

  // Workout configuration
  const [numberOfSets, setNumberOfSets] = useState(initialData.numberOfSets || 4);
  const [muscleGroup, setMuscleGroup] = useState(initialData.muscleGroup || '');
  const [setRangeLabel, setSetRangeLabel] = useState(initialData.setRangeLabel || '4 sets');

  // Favorites and previous data
  const [favoriteExercises, setFavoriteExercises] = useState(initialData.favoriteExercises || []);
  const [previousWorkoutData, setPreviousWorkoutData] = useState(initialData.previousWorkoutData || null);
  const [previousCustomExercises, setPreviousCustomExercises] = useState(initialData.previousCustomExercises || []);

  // UI state
  const [isEditingSets, setIsEditingSets] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [absExpanded, setAbsExpanded] = useState(true);
  const [cardioExpanded, setCardioExpanded] = useState(true);

  // Exercise ordering
  const [mainExerciseOrder, setMainExerciseOrder] = useState(initialData.mainExerciseOrder || []);

  // Optional sections state
  const [showCardio, setShowCardio] = useState(initialData.showCardio || false);
  const [showAbs, setShowAbs] = useState(initialData.showAbs || false);
  const [cardioAtTop, setCardioAtTop] = useState(initialData.cardioAtTop || false);
  const [absAtTop, setAbsAtTop] = useState(initialData.absAtTop || false);
  const [sectionOrder, setSectionOrder] = useState(initialData.sectionOrder || 'abs-first');

  // Callback for adding custom exercises (set by MuscleGroupWorkout)
  const [addCustomExercise, setAddCustomExercise] = useState(() => () => {
    console.warn('addCustomExercise not yet registered');
  });

  // Handle exercise data changes
  const handleExerciseDataChange = useCallback((categoryKey, exerciseName, setIndex, setInput, detectedCategory) => {
    setExerciseData(prevExerciseData => {
      const updatedExerciseData = { ...prevExerciseData };

      const isCardio = categoryKey.startsWith('cardio') || categoryKey.startsWith('custom_cardio');
      const isAbs = categoryKey.startsWith('abs') || categoryKey.startsWith('custom_abs');
      const isCardioOrAbs = isCardio || isAbs;

      if (!updatedExerciseData[categoryKey]) {
        const safeSetsCount = numberOfSets && numberOfSets > 0 ? numberOfSets : 4;
        const setsArray = isCardio ? [] : new Array(safeSetsCount).fill('');
        updatedExerciseData[categoryKey] = {
          sets: setsArray,
          exerciseName: exerciseName,
        };

        if (!isCardioOrAbs) {
          setMainExerciseOrder(prev => [...prev, categoryKey]);
        }
      }

      if (setIndex === -1) {
        updatedExerciseData[categoryKey].exerciseName = exerciseName;
        if (detectedCategory) {
          if (isCardioOrAbs) {
            updatedExerciseData[categoryKey].selection = detectedCategory;
          } else {
            updatedExerciseData[categoryKey].detectedCategory = detectedCategory;
          }
        }
        if (!updatedExerciseData[categoryKey].sets || updatedExerciseData[categoryKey].sets.length === 0) {
          const safeSetsCount = numberOfSets && numberOfSets > 0 ? numberOfSets : 4;
          updatedExerciseData[categoryKey].sets = isCardio ? [] : new Array(safeSetsCount).fill('');
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

    const isCardioOrAbs = categoryKey.startsWith('cardio') || categoryKey.startsWith('custom_cardio') ||
                          categoryKey.startsWith('abs') || categoryKey.startsWith('custom_abs');
    if (!isCardioOrAbs) {
      setMainExerciseOrder(prev => prev.filter(key => key !== categoryKey));
    }

    // Call optional callback for additional cleanup (e.g., Firebase save)
    if (onDelete) {
      onDelete(updatedExerciseData, isCardioOrAbs ? mainExerciseOrder : mainExerciseOrder.filter(key => key !== categoryKey));
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

  // Cardio section movement handlers
  const handleCardioMoveUp = useCallback(() => {
    if (!cardioAtTop) {
      if (!absAtTop) {
        if (sectionOrder === 'abs-first') {
          setSectionOrder('cardio-first');
        } else {
          setCardioAtTop(true);
        }
      } else {
        setCardioAtTop(true);
      }
    } else {
      if (absAtTop) {
        if (sectionOrder === 'abs-first') {
          setSectionOrder('cardio-first');
        }
      }
    }
  }, [cardioAtTop, absAtTop, sectionOrder]);

  const handleCardioMoveDown = useCallback(() => {
    if (cardioAtTop) {
      if (absAtTop) {
        if (sectionOrder === 'cardio-first') {
          setSectionOrder('abs-first');
        } else {
          setCardioAtTop(false);
        }
      } else {
        setCardioAtTop(false);
      }
    } else {
      if (!absAtTop) {
        if (sectionOrder === 'cardio-first') {
          setSectionOrder('abs-first');
        }
      }
    }
  }, [cardioAtTop, absAtTop, sectionOrder]);

  // Abs section movement handlers
  const handleAbsMoveUp = useCallback(() => {
    if (!absAtTop) {
      if (!cardioAtTop) {
        if (sectionOrder === 'cardio-first') {
          setSectionOrder('abs-first');
        } else {
          setAbsAtTop(true);
        }
      } else {
        setAbsAtTop(true);
      }
    } else {
      if (cardioAtTop) {
        if (sectionOrder === 'cardio-first') {
          setSectionOrder('abs-first');
        }
      }
    }
  }, [absAtTop, cardioAtTop, sectionOrder]);

  const handleAbsMoveDown = useCallback(() => {
    if (absAtTop) {
      if (cardioAtTop) {
        if (sectionOrder === 'abs-first') {
          setSectionOrder('cardio-first');
        } else {
          setAbsAtTop(false);
        }
      } else {
        setAbsAtTop(false);
      }
    } else {
      if (!cardioAtTop) {
        if (sectionOrder === 'abs-first') {
          setSectionOrder('cardio-first');
        }
      }
    }
  }, [absAtTop, cardioAtTop, sectionOrder]);

  // Update all state at once (useful for loading from Firebase)
  const updateWorkoutState = useCallback((updates) => {
    if (updates.exerciseData !== undefined) setExerciseData(updates.exerciseData);
    if (updates.numberOfSets !== undefined) setNumberOfSets(updates.numberOfSets);
    if (updates.muscleGroup !== undefined) setMuscleGroup(updates.muscleGroup);
    if (updates.setRangeLabel !== undefined) setSetRangeLabel(updates.setRangeLabel);
    if (updates.favoriteExercises !== undefined) setFavoriteExercises(updates.favoriteExercises);
    if (updates.previousWorkoutData !== undefined) setPreviousWorkoutData(updates.previousWorkoutData);
    if (updates.previousCustomExercises !== undefined) setPreviousCustomExercises(updates.previousCustomExercises);
    if (updates.mainExerciseOrder !== undefined) setMainExerciseOrder(updates.mainExerciseOrder);
    if (updates.showCardio !== undefined) setShowCardio(updates.showCardio);
    if (updates.showAbs !== undefined) setShowAbs(updates.showAbs);
    if (updates.cardioAtTop !== undefined) setCardioAtTop(updates.cardioAtTop);
    if (updates.absAtTop !== undefined) setAbsAtTop(updates.absAtTop);
    if (updates.sectionOrder !== undefined) setSectionOrder(updates.sectionOrder);
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
    absExpanded,
    setAbsExpanded,
    cardioExpanded,
    setCardioExpanded,
    mainExerciseOrder,
    setMainExerciseOrder,
    showCardio,
    setShowCardio,
    showAbs,
    setShowAbs,
    cardioAtTop,
    setCardioAtTop,
    absAtTop,
    setAbsAtTop,
    sectionOrder,
    setSectionOrder,
    addCustomExercise,
    setAddCustomExercise,

    // Functions
    handleExerciseDataChange,
    batchInitializeExercises,
    handleRemoveExercise,
    handleRemoveSet,
    handleReorderExercises,
    toggleFavorite,
    handleCardioMoveUp,
    handleCardioMoveDown,
    handleAbsMoveUp,
    handleAbsMoveDown,
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
