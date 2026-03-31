/**
 * Workout Data Types & Factory Functions
 * Central source of truth for all workout-related data structures
 */

/**
 * Create a new workout with default values
 */
export const createWorkout = ({
  workoutName = 'Workout',
  selectedMuscleGroup = null,
  numberOfSets = null,
  exerciseData = {},
  note = '',
  showCardio = false,
  showAbs = false,
  cardioAtTop = false,
  absAtTop = false,
  templateId = null,
  templateName = null,
  workoutDate = null,
} = {}) => ({
  workoutName,
  selectedMuscleGroup,
  numberOfSets,
  exerciseData,
  note,
  showCardio,
  showAbs,
  cardioAtTop,
  absAtTop,
  templateId,
  templateName,
  workoutDate: workoutDate || new Date().toISOString().split('T')[0],
});

/**
 * Create exercise data entry
 */
export const createExerciseEntry = ({
  exerciseName = '',
  sets = [],
  linkedExerciseId = null,
  detectedCategory = null,
} = {}) => ({
  exerciseName,
  sets,
  ...(linkedExerciseId && { linkedExerciseId }),
  ...(detectedCategory && { detectedCategory }),
});

/**
 * Create active workout session (for StartWorkoutPage)
 */
export const createWorkoutSession = ({
  workoutName,
  startTime,
  exercises = [],
  currentSetIndex = 0,
  workoutData = null,
} = {}) => ({
  workoutName,
  startTime: startTime || Date.now(),
  exercises,
  currentSetIndex,
  workoutData,
});

/**
 * Create exercise for workout session
 */
export const createSessionExercise = ({
  key,
  exerciseName,
  totalSets = 4,
  completedSets = [],
} = {}) => ({
  key,
  exerciseName,
  totalSets,
  completedSets,
});

/**
 * Create completed set entry
 */
export const createCompletedSet = ({
  setNumber,
  weight = '',
  reps = '',
  timestamp = null,
} = {}) => ({
  setNumber,
  weight,
  reps,
  timestamp: timestamp || Date.now(),
});

/**
 * Validate workout data structure
 */
export const isValidWorkout = (workout) => {
  return (
    workout &&
    typeof workout === 'object' &&
    workout.selectedMuscleGroup !== null &&
    workout.numberOfSets !== null
  );
};

/**
 * Validate exercise data structure
 */
export const isValidExerciseData = (exerciseData) => {
  return (
    exerciseData &&
    typeof exerciseData === 'object' &&
    Object.keys(exerciseData).length > 0
  );
};

/**
 * Convert workout to Firebase format
 */
export const workoutToFirebaseFormat = (workout, userId, summary = '') => {
  const { workoutDate, ...workoutData } = workout;

  return {
    userId,
    muscleGroup: workout.selectedMuscleGroup,
    numberOfSets: workout.numberOfSets,
    date: workoutDate,
    exerciseData: workout.exerciseData,
    note: workout.note,
    summary,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Convert Firebase data to workout format
 */
export const firebaseToWorkoutFormat = (firebaseData) => {
  return createWorkout({
    workoutName: firebaseData.muscleGroup || 'Workout',
    selectedMuscleGroup: firebaseData.muscleGroup,
    numberOfSets: firebaseData.numberOfSets,
    exerciseData: firebaseData.exerciseData || {},
    note: firebaseData.note || '',
    workoutDate: firebaseData.date,
  });
};
