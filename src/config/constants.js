/**
 * Application Constants
 *
 * Centralized constants to avoid magic strings throughout the codebase
 */

// ====================================
// MUSCLE GROUPS
// ====================================
export const MUSCLE_GROUPS = {
  CHEST: 'chest',
  BACK: 'back',
  LEGS: 'legs',
  SHOULDERS: 'shoulders',
  CUSTOM: 'custom',
};

// ====================================
// UI OPTIONS
// ====================================

/**
 * Muscle group dropdown options for workout selection
 */
export const MUSCLE_GROUP_OPTIONS = [
  { label: 'Chest/Triceps', value: MUSCLE_GROUPS.CHEST },
  { label: 'Back/Biceps', value: MUSCLE_GROUPS.BACK },
  { label: 'Legs', value: MUSCLE_GROUPS.LEGS },
  { label: 'Shoulders/Forearms', value: MUSCLE_GROUPS.SHOULDERS },
  { label: 'Custom', value: MUSCLE_GROUPS.CUSTOM },
];

/**
 * Set count and rep range options for hypertrophy training
 */
export const SET_RANGE_OPTIONS = [
  { label: '3x15', value: 3, reps: 15 },
  { label: '4x12', value: 4, reps: 12 },
  { label: '5x8', value: 5, reps: 8 },
  { label: 'Custom', value: 'custom', reps: null },
];

// ====================================
// FIREBASE FIELD NAMES
// ====================================

/**
 * Field names used in Firebase documents
 * Maintaining both old (legacy) and new field names for backward compatibility
 */
export const FIREBASE_FIELDS = {
  // New field names (preferred)
  MUSCLE_GROUP: 'muscleGroup',
  NUMBER_OF_SETS: 'numberOfSets',
  EXERCISE_DATA: 'exerciseData',

  // Legacy field names (for backward compatibility)
  LEGACY_TARGET: 'target',
  LEGACY_REPS: 'reps',
  LEGACY_INPUTS: 'inputs',

  // Common fields (unchanged)
  USER_ID: 'userId',
  DATE: 'date',
  NOTE: 'note',
  SUMMARY: 'summary',
};

// ====================================
// EXERCISE DATA FIELD NAMES
// ====================================

/**
 * Field names within exercise data objects
 */
export const EXERCISE_FIELDS = {
  // New field names (preferred)
  EXERCISE_NAME: 'exerciseName',
  SETS: 'sets',

  // Legacy field names (for backward compatibility)
  LEGACY_SELECTION: 'selection',
  LEGACY_INPUT: 'input',
};

// ====================================
// GRAPH/CHART VIEWS
// ====================================

/**
 * Available graph view modes
 */
export const GRAPH_VIEWS = {
  PREVIOUS: 'previous',
  MONTHLY: 'monthly',
};

