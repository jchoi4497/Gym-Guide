// ====================================
// MUSCLE GROUPS
// ====================================
export const MUSCLE_GROUPS = {
  CHEST: 'chest',
  BACK: 'back',
  LEGS: 'legs',
  SHOULDERS: 'shoulders',
  CARDIO: 'cardio',
  CORE: 'core',
};

// ====================================
// EXERCISE CATEGORIES
// ====================================
export const EXERCISE_CATEGORIES = {
  // Chest categories
  INCLINE_PRESS: 'incline',
  CHEST_PRESS: 'chestpress',
  CHEST_FLY: 'fly',
  TRICEP_PRIMARY: 'tri',
  TRICEP_SECONDARY: 'tri2',

  // Back categories
  PULLUP: 'pullup',
  ROW: 'row',
  LAT_PULLDOWN: 'lat',
  BICEP_PRIMARY: 'bicep',
  BICEP_SECONDARY: 'bicep2',

  // Legs categories
  SQUAT: 'squat',
  SPLIT_SQUAT: 'splitsquat',
  BACK_EXTENSION: 'backextension',
  CALF_RAISE: 'calfraise',

  // Shoulders categories
  SHOULDER_PRESS: 'shoulderpress',
  REAR_DELT_PRIMARY: 'reardelt',
  REAR_DELT_SECONDARY: 'reardelt2',
  LAT_RAISE_PRIMARY: 'latraise',
  LAT_RAISE_SECONDARY: 'latraise2',
  FRONT_RAISE: 'frontraise',
  WRIST_CURL: 'wristcurl',
  REVERSE_WRIST_CURL: 'reversewristcurl',

  // Cardio categories
  CARDIO: 'cardio',

  // Abs/Core categories
  ABS: 'abs',
};

// ====================================
// EXERCISES DATABASE
// ====================================
export const EXERCISES = {
  // ========== CHEST EXERCISES ==========

  // Incline Press
  DUMBBELL_INCLINE_PRESS: {
    id: 'dip',
    name: 'Dumbbell Incline Bench Press',
    category: EXERCISE_CATEGORIES.INCLINE_PRESS,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },
  MACHINE_INCLINE_PRESS: {
    id: 'mip',
    name: 'Machine Incline Chest Press',
    category: EXERCISE_CATEGORIES.INCLINE_PRESS,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },
  SMITH_MACHINE_INCLINE_PRESS: {
    id: 'smip',
    name: 'Smith Machine Incline Bench Press',
    category: EXERCISE_CATEGORIES.INCLINE_PRESS,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },
  BARBELL_INCLINE_PRESS: {
    id: 'bip',
    name: 'Barbell Incline Bench Press',
    category: EXERCISE_CATEGORIES.INCLINE_PRESS,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },

  // Chest Press
  DUMBBELL_PRESS: {
    id: 'dp',
    name: 'Dumbbell Bench Press',
    category: EXERCISE_CATEGORIES.CHEST_PRESS,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },
  MACHINE_PRESS: {
    id: 'mp',
    name: 'Machine Chest Press',
    category: EXERCISE_CATEGORIES.CHEST_PRESS,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },
  SMITH_MACHINE_PRESS: {
    id: 'smp',
    name: 'Smith Machine Bench Press',
    category: EXERCISE_CATEGORIES.CHEST_PRESS,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },
  BARBELL_PRESS: {
    id: 'bp',
    name: 'Barbell Bench Press',
    category: EXERCISE_CATEGORIES.CHEST_PRESS,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },

  // Chest Fly
  CHEST_FLY_MACHINE: {
    id: 'cfm',
    name: 'Chest Fly Machine',
    category: EXERCISE_CATEGORIES.CHEST_FLY,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },
  CABLE_FLYS: {
    id: 'cf',
    name: 'Cable Flys',
    category: EXERCISE_CATEGORIES.CHEST_FLY,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },
  DUMBBELL_FLYS: {
    id: 'df',
    name: 'Dumbbell Flys',
    category: EXERCISE_CATEGORIES.CHEST_FLY,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },

  // Tricep Exercises (used in both primary and secondary)
  STRAIGHT_BAR_CABLE_PUSH_DOWNS: {
    id: 'sbcpd',
    name: 'Straight Bar Tricep Pushdown',
    category: EXERCISE_CATEGORIES.TRICEP_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },
  ROPE_PULL_DOWNS: {
    id: 'rpd',
    name: 'Rope Tricep Pushdown',
    category: EXERCISE_CATEGORIES.TRICEP_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },
  ONE_ARM_CABLE_PULL_DOWNS_TRICEP: {
    id: 'oacpd',
    name: '1 Arm Cable Tricep Pushdown',
    category: EXERCISE_CATEGORIES.TRICEP_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },
  OVERHEAD_BAR_CABLE_EXTENSIONS: {
    id: 'obce',
    name: 'Overhead Cable Tricep Extension',
    category: EXERCISE_CATEGORIES.TRICEP_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },
  OVERHEAD_DUMBBELL_EXTENSIONS: {
    id: 'ode',
    name: 'Overhead Dumbbell Tricep Extension',
    category: EXERCISE_CATEGORIES.TRICEP_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },
  DIPS: {
    id: 'd',
    name: 'Dips',
    category: EXERCISE_CATEGORIES.TRICEP_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.CHEST,
  },

  // ========== BACK EXERCISES ==========

  // Pull Ups
  PULL_UPS: {
    id: 'pu',
    name: 'Pull Ups',
    category: EXERCISE_CATEGORIES.PULLUP,
    muscleGroup: MUSCLE_GROUPS.BACK,
    metricType: 'bodyweight',
  },
  ASSISTED_PULL_UPS: {
    id: 'apu',
    name: 'Assisted Pull Ups',
    category: EXERCISE_CATEGORIES.PULLUP,
    muscleGroup: MUSCLE_GROUPS.BACK,
    metricType: 'weighted',
  },
  LAT_PULL_DOWNS_PULLUP: {
    id: 'lpd',
    name: 'Lat Pull Downs',
    category: EXERCISE_CATEGORIES.PULLUP,
    muscleGroup: MUSCLE_GROUPS.BACK,
    metricType: 'weighted',
  },
  BAND_ASSIST_PULL_UPS: {
    id: 'bapu',
    name: 'Band Assist Pull Ups',
    category: EXERCISE_CATEGORIES.PULLUP,
    muscleGroup: MUSCLE_GROUPS.BACK,
    metricType: 'bodyweight',
  },
  NEGATIVE_PULL_UPS: {
    id: 'npu',
    name: 'Negative Pull Ups',
    category: EXERCISE_CATEGORIES.PULLUP,
    muscleGroup: MUSCLE_GROUPS.BACK,
    metricType: 'bodyweight',
  },
  WEIGHTED_PULL_UPS: {
    id: 'wpu',
    name: 'Weighted Pull Ups',
    category: EXERCISE_CATEGORIES.PULLUP,
    muscleGroup: MUSCLE_GROUPS.BACK,
    metricType: 'weighted',
  },

  // Rows
  MACHINE_ROWS: {
    id: 'mr',
    name: 'Machine Rows',
    category: EXERCISE_CATEGORIES.ROW,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  BENT_OVER_ROWS_BARBELL: {
    id: 'borb',
    name: 'Barbell Bent Over Rows',
    category: EXERCISE_CATEGORIES.ROW,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  BENT_OVER_ROWS_DUMBBELL: {
    id: 'bord',
    name: 'Dumbbell Bent Over Rows',
    category: EXERCISE_CATEGORIES.ROW,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  ONE_ARM_BENT_OVER_ROWS: {
    id: 'oabor',
    name: '1 Arm Dumbbell Bent Over Rows',
    category: EXERCISE_CATEGORIES.ROW,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  T_BAR_ROW: {
    id: 'tbr',
    name: 'T-Bar Row',
    category: EXERCISE_CATEGORIES.ROW,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  CABLE_ROWS_ONE_ARM: {
    id: 'croa',
    name: '1 Arm Cable Rows',
    category: EXERCISE_CATEGORIES.ROW,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  CABLE_ROWS_BAR: {
    id: 'crb',
    name: 'Seated Cable Rows',
    category: EXERCISE_CATEGORIES.ROW,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },

  // Lat Pulldowns
  LAT_PULL_DOWNS: {
    id: 'lpdt',
    name: 'Lat Pull Downs',
    category: EXERCISE_CATEGORIES.LAT_PULLDOWN,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  ASSISTED_PULL_UPS_LAT: {
    id: 'aput',
    name: 'Assisted Pull Ups',
    category: EXERCISE_CATEGORIES.LAT_PULLDOWN,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  V_BAR_PULL_DOWNS: {
    id: 'vbpd',
    name: 'V-bar Pull Downs',
    category: EXERCISE_CATEGORIES.LAT_PULLDOWN,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  NEUTRAL_GRIP_LAT_PULL_DOWNS: {
    id: 'nglpd',
    name: 'Neutral Grip Lat Pull Downs',
    category: EXERCISE_CATEGORIES.LAT_PULLDOWN,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  STRAIGHT_ARM_PULL_DOWNS: {
    id: 'sapd',
    name: 'Straight Arm Pull Downs',
    category: EXERCISE_CATEGORIES.LAT_PULLDOWN,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },

  // Bicep Exercises
  DUMBBELL_BICEP_CURLS: {
    id: 'dbc',
    name: 'Dumbbell Bicep Curls',
    category: EXERCISE_CATEGORIES.BICEP_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  STRAIGHT_BAR_BICEP_CURLS: {
    id: 'sbbc',
    name: 'Straight Bar Bicep Curls',
    category: EXERCISE_CATEGORIES.BICEP_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  STRAIGHT_BAR_PREACHER_CURLS: {
    id: 'sbpc',
    name: 'Straight Bar Preacher Curls',
    category: EXERCISE_CATEGORIES.BICEP_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  DUMBBELL_PREACHER_CURLS: {
    id: 'dpc',
    name: 'Dumbbell Preacher Curls',
    category: EXERCISE_CATEGORIES.BICEP_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  CABLE_CURLS_BAR_GRIP: {
    id: 'ccbg',
    name: 'Cable Curls w/ Bar Grip',
    category: EXERCISE_CATEGORIES.BICEP_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },
  MACHINE_BICEP_CURLS: {
    id: 'mbc',
    name: 'Machine Bicep Curls',
    category: EXERCISE_CATEGORIES.BICEP_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.BACK,
  },

  // ========== LEGS EXERCISES ==========

  // Squats
  BARBELL_SQUATS: {
    id: 'bs',
    name: 'Barbell Squats',
    category: EXERCISE_CATEGORIES.SQUAT,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },
  SMITH_MACHINE_SQUATS: {
    id: 'sms',
    name: 'Smith Machine Squats',
    category: EXERCISE_CATEGORIES.SQUAT,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },
  MACHINE_LEG_PRESS: {
    id: 'mlp',
    name: 'Machine Leg Press',
    category: EXERCISE_CATEGORIES.SQUAT,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },
  GOBLET_SQUATS: {
    id: 'gs',
    name: 'Goblet Squats',
    category: EXERCISE_CATEGORIES.SQUAT,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },
  LEG_EXTENSIONS: {
    id: 'le',
    name: 'Leg Extensions',
    category: EXERCISE_CATEGORIES.SQUAT,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },

  // Split Squats
  DUMBBELL_BULGARIAN_SPLIT_SQUATS: {
    id: 'dbss',
    name: 'Dumbbell Bulgarian Split Squats',
    category: EXERCISE_CATEGORIES.SPLIT_SQUAT,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },
  SMITH_MACHINE_BULGARIAN_SPLIT_SQUATS: {
    id: 'smbss',
    name: 'Smith Machine Bulgarian Split Squats',
    category: EXERCISE_CATEGORIES.SPLIT_SQUAT,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },
  HACK_SQUATS: {
    id: 'hs',
    name: 'Hack Squats',
    category: EXERCISE_CATEGORIES.SPLIT_SQUAT,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },
  LEG_CURLS: {
    id: 'lc',
    name: 'Leg Curls',
    category: EXERCISE_CATEGORIES.SPLIT_SQUAT,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },

  // Back Extensions
  ISOMETRIC_BACK_EXTENSION: {
    id: 'ibe',
    name: 'Isometric Back Extension',
    category: EXERCISE_CATEGORIES.BACK_EXTENSION,
    muscleGroup: MUSCLE_GROUPS.LEGS,
    metricType: 'timed',
  },
  BACK_EXTENSIONS: {
    id: 'be',
    name: 'Back Extensions',
    category: EXERCISE_CATEGORIES.BACK_EXTENSION,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },
  ROMANIAN_DEADLIFT: {
    id: 'rdl',
    name: 'Romanian Deadlift (RDL)',
    category: EXERCISE_CATEGORIES.BACK_EXTENSION,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },
  DUMBBELL_RDL: {
    id: 'dbrdl',
    name: 'Dumbbell RDL',
    category: EXERCISE_CATEGORIES.BACK_EXTENSION,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },
  DEADLIFT: {
    id: 'dl',
    name: 'Deadlift',
    category: EXERCISE_CATEGORIES.BACK_EXTENSION,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },
  GOOD_MORNINGS: {
    id: 'gm',
    name: 'Good Mornings',
    category: EXERCISE_CATEGORIES.BACK_EXTENSION,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },

  // Calf Raises
  CALF_RAISE_MACHINE: {
    id: 'crm',
    name: 'Calf Raise Machine',
    category: EXERCISE_CATEGORIES.CALF_RAISE,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },
  SEATED_CALF_RAISES: {
    id: 'scr',
    name: 'Seated Calf Raises',
    category: EXERCISE_CATEGORIES.CALF_RAISE,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },
  SMITH_MACHINE_CALF_RAISES: {
    id: 'smcr',
    name: 'Smith Machine Calf Raises',
    category: EXERCISE_CATEGORIES.CALF_RAISE,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },
  BARBELL_CALF_RAISES: {
    id: 'bcr',
    name: 'Barbell Calf Raises',
    category: EXERCISE_CATEGORIES.CALF_RAISE,
    muscleGroup: MUSCLE_GROUPS.LEGS,
  },

  // ========== SHOULDERS EXERCISES ==========

  // Shoulder Press
  DUMBBELL_SHOULDER_PRESS: {
    id: 'dsp',
    name: 'Dumbbell Shoulder Press',
    category: EXERCISE_CATEGORIES.SHOULDER_PRESS,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  BARBELL_SHOULDER_PRESS: {
    id: 'bsp',
    name: 'Barbell Shoulder Press',
    category: EXERCISE_CATEGORIES.SHOULDER_PRESS,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  SMITH_MACHINE_SHOULDER_PRESS: {
    id: 'smsp',
    name: 'Smith Machine Shoulder Press',
    category: EXERCISE_CATEGORIES.SHOULDER_PRESS,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  MACHINE_SHOULDER_PRESS: {
    id: 'msp',
    name: 'Machine Shoulder Press',
    category: EXERCISE_CATEGORIES.SHOULDER_PRESS,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },

  // Rear Delt
  REAR_DELT_MACHINE: {
    id: 'rdm',
    name: 'Rear Delt Machine',
    category: EXERCISE_CATEGORIES.REAR_DELT_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  ONE_ARM_REAR_DELT_MACHINE: {
    id: 'oardm',
    name: '1 Arm Rear Delt Machine',
    category: EXERCISE_CATEGORIES.REAR_DELT_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  CABLE_REAR_DELT_FLYS: {
    id: 'crdf',
    name: 'Cable Rear Delt Flys',
    category: EXERCISE_CATEGORIES.REAR_DELT_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  ONE_ARM_CABLE_REAR_DELT_FLYS: {
    id: 'oacrdf',
    name: '1 Arm Cable Rear Delt Flys',
    category: EXERCISE_CATEGORIES.REAR_DELT_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  DUMBBELL_REAR_DELT_FLYS: {
    id: 'drdf',
    name: 'Dumbbell Rear Delt Flys',
    category: EXERCISE_CATEGORIES.REAR_DELT_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  CABLE_FACE_PULLS: {
    id: 'cfp',
    name: 'Cable Face Pulls',
    category: EXERCISE_CATEGORIES.REAR_DELT_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },

  // Lateral Raises
  DUMBBELL_LAT_RAISES: {
    id: 'dlr',
    name: 'Dumbbell Lateral Raises',
    category: EXERCISE_CATEGORIES.LAT_RAISE_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  ONE_ARM_CABLE_LAT_RAISES: {
    id: 'oacdlr',
    name: '1 Arm Cable Lateral Raises',
    category: EXERCISE_CATEGORIES.LAT_RAISE_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  MACHINE_LAT_RAISES: {
    id: 'mlr',
    name: 'Machine Lateral Raises',
    category: EXERCISE_CATEGORIES.LAT_RAISE_PRIMARY,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },

  // Front Raises
  DUMBBELL_FRONT_RAISES: {
    id: 'dfr',
    name: 'Dumbbell Front Raises',
    category: EXERCISE_CATEGORIES.FRONT_RAISE,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  BARBELL_FRONT_RAISES: {
    id: 'bfr',
    name: 'Barbell Front Raises',
    category: EXERCISE_CATEGORIES.FRONT_RAISE,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  CABLE_FRONT_RAISES: {
    id: 'cfr',
    name: 'Cable Front Raises',
    category: EXERCISE_CATEGORIES.FRONT_RAISE,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },

  // Wrist Curls
  CABLE_WRIST_CURLS: {
    id: 'cwc',
    name: 'Cable Wrist Curls w/ Bar',
    category: EXERCISE_CATEGORIES.WRIST_CURL,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  BARBELL_BEHIND_BACK_WRIST_CURLS: {
    id: 'bbbwc',
    name: 'Barbell Behind Back Wrist Curls',
    category: EXERCISE_CATEGORIES.WRIST_CURL,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  DUMBBELL_WRIST_CURLS: {
    id: 'dbwc',
    name: 'Dumbbell Wrist Curls',
    category: EXERCISE_CATEGORIES.WRIST_CURL,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },

  // Reverse Wrist Curls
  REVERSE_DUMBBELL_WRIST_CURLS: {
    id: 'rdbwc',
    name: 'Reverse Dumbbell Wrist Curls',
    category: EXERCISE_CATEGORIES.REVERSE_WRIST_CURL,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },
  FOREARM_CURLS_EASY_BAR: {
    id: 'fc',
    name: 'Forearm Curls w/ Easy Bar',
    category: EXERCISE_CATEGORIES.REVERSE_WRIST_CURL,
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
  },

  // ========== CARDIO EXERCISES ==========

  TREADMILL: {
    id: 'treadmill',
    name: 'Treadmill',
    category: EXERCISE_CATEGORIES.CARDIO,
    muscleGroup: MUSCLE_GROUPS.CARDIO,
  },
  STATIONARY_BIKE: {
    id: 'bike',
    name: 'Stationary Bike',
    category: EXERCISE_CATEGORIES.CARDIO,
    muscleGroup: MUSCLE_GROUPS.CARDIO,
  },
  ELLIPTICAL: {
    id: 'elliptical',
    name: 'Elliptical',
    category: EXERCISE_CATEGORIES.CARDIO,
    muscleGroup: MUSCLE_GROUPS.CARDIO,
  },
  STAIRMASTER: {
    id: 'stairmaster',
    name: 'StairMaster',
    category: EXERCISE_CATEGORIES.CARDIO,
    muscleGroup: MUSCLE_GROUPS.CARDIO,
  },
  RUNNING: {
    id: 'running',
    name: 'Running',
    category: EXERCISE_CATEGORIES.CARDIO,
    muscleGroup: MUSCLE_GROUPS.CARDIO,
  },

  // ========== ABS/CORE EXERCISES ==========

  AB_CRUNCH_MACHINE: {
    id: 'abcrunchmachine',
    name: 'Ab Crunch Machine',
    category: EXERCISE_CATEGORIES.ABS,
    muscleGroup: MUSCLE_GROUPS.CORE,
    metricType: 'weighted',
  },
  DECLINE_SITUP_BENCH: {
    id: 'declinesitup',
    name: 'Decline Sit-Up Bench',
    category: EXERCISE_CATEGORIES.ABS,
    muscleGroup: MUSCLE_GROUPS.CORE,
    metricType: 'weighted',
  },
  CRUNCHES: {
    id: 'crunches',
    name: 'Crunches',
    category: EXERCISE_CATEGORIES.ABS,
    muscleGroup: MUSCLE_GROUPS.CORE,
    metricType: 'bodyweight',
  },
  LEG_RAISES: {
    id: 'legraises',
    name: 'Leg Raises',
    category: EXERCISE_CATEGORIES.ABS,
    muscleGroup: MUSCLE_GROUPS.CORE,
    metricType: 'bodyweight',
  },
  PLANK: {
    id: 'plank',
    name: 'Plank',
    category: EXERCISE_CATEGORIES.ABS,
    muscleGroup: MUSCLE_GROUPS.CORE,
    metricType: 'timed',
  },
};

// ====================================
// HELPER FUNCTIONS
// ====================================

/**
 * Get all exercises for a specific category
 * Returns array of {label, value} for dropdown options
 */
export function getExercisesByCategory(category) {
  return Object.values(EXERCISES)
    .filter(exercise => exercise.category === category)
    .map(exercise => ({
      label: exercise.name,
      value: exercise.id,
    }));
}

/**
 * Get all exercises for a specific muscle group
 * Returns array of {label, value} for dropdown options
 */
export function getExercisesByMuscleGroup(muscleGroup) {
  return Object.values(EXERCISES)
    .filter(exercise => exercise.muscleGroup === muscleGroup)
    .map(exercise => ({
      label: exercise.name,
      value: exercise.id,
    }));
}

/**
 * Get placeholder text based on exercise metric type
 */
export function getPlaceholderForExercise(exerciseId) {
  const exercise = Object.values(EXERCISES).find(ex => ex.id === exerciseId);

  if (!exercise || !exercise.metricType) {
    return 'Weight x Reps'; // Default
  }

  switch (exercise.metricType) {
    case 'bodyweight':
      return 'Reps';
    case 'timed':
      return 'Duration (sec)';
    case 'weighted':
    default:
      return 'Weight x Reps';
  }
}

/**
 * Get exercise by ID
 */
export function getExerciseById(exerciseId) {
  return Object.values(EXERCISES).find(exercise => exercise.id === exerciseId);
}

/**
 * Get exercise name by ID
 */
export function getExerciseName(exerciseId) {
  const exercise = getExerciseById(exerciseId);
  return exercise ? exercise.name : exerciseId; // Fallback to ID if not found
}

// ====================================
// DEFAULT EXERCISE CONFIGURATIONS
// ====================================

/**
 * Default exercise setup for each muscle group
 * These match the original defaults from the workout components
 */
export const DEFAULT_EXERCISES = {
  [MUSCLE_GROUPS.CHEST]: [
    {
      id: EXERCISE_CATEGORIES.INCLINE_PRESS,
      selected: 'dip', // Dumbbell Incline Press
      options: getExercisesByCategory(EXERCISE_CATEGORIES.INCLINE_PRESS),
    },
    {
      id: EXERCISE_CATEGORIES.CHEST_PRESS,
      selected: 'mp', // Machine Press
      options: getExercisesByCategory(EXERCISE_CATEGORIES.CHEST_PRESS),
    },
    {
      id: EXERCISE_CATEGORIES.CHEST_FLY,
      selected: 'cfm', // Chest Fly Machine
      options: getExercisesByCategory(EXERCISE_CATEGORIES.CHEST_FLY),
    },
    {
      id: EXERCISE_CATEGORIES.TRICEP_PRIMARY,
      selected: 'sbcpd', // Straight Bar Cable Push Downs
      options: getExercisesByCategory(EXERCISE_CATEGORIES.TRICEP_PRIMARY),
    },
    {
      id: EXERCISE_CATEGORIES.TRICEP_SECONDARY,
      selected: 'oacpd', // 1 Arm Cable Pull Downs (using same exercises as primary)
      options: getExercisesByCategory(EXERCISE_CATEGORIES.TRICEP_PRIMARY),
    },
  ],

  [MUSCLE_GROUPS.BACK]: [
    {
      id: EXERCISE_CATEGORIES.PULLUP,
      selected: 'pu', // Pull Ups
      options: getExercisesByCategory(EXERCISE_CATEGORIES.PULLUP),
    },
    {
      id: EXERCISE_CATEGORIES.ROW,
      selected: 'mr', // Machine Rows
      options: getExercisesByCategory(EXERCISE_CATEGORIES.ROW),
    },
    {
      id: EXERCISE_CATEGORIES.LAT_PULLDOWN,
      selected: 'lpdt', // Lat Pull Downs
      options: getExercisesByCategory(EXERCISE_CATEGORIES.LAT_PULLDOWN),
    },
    {
      id: EXERCISE_CATEGORIES.BICEP_PRIMARY,
      selected: 'dbc', // Dumbbell Bicep Curls
      options: getExercisesByCategory(EXERCISE_CATEGORIES.BICEP_PRIMARY),
    },
    {
      id: EXERCISE_CATEGORIES.BICEP_SECONDARY,
      selected: 'sbpc', // Straight Bar Preacher Curls (using same exercises as primary)
      options: getExercisesByCategory(EXERCISE_CATEGORIES.BICEP_PRIMARY),
    },
  ],

  [MUSCLE_GROUPS.LEGS]: [
    {
      id: EXERCISE_CATEGORIES.SQUAT,
      selected: 'bs', // Barbell Squats
      options: getExercisesByCategory(EXERCISE_CATEGORIES.SQUAT),
    },
    {
      id: EXERCISE_CATEGORIES.SPLIT_SQUAT,
      selected: 'dbss', // Dumbbell Bulgarian Split Squats
      options: getExercisesByCategory(EXERCISE_CATEGORIES.SPLIT_SQUAT),
    },
    {
      id: EXERCISE_CATEGORIES.BACK_EXTENSION,
      selected: 'ibe', // Isometric Back Extension
      options: getExercisesByCategory(EXERCISE_CATEGORIES.BACK_EXTENSION),
    },
    {
      id: 'backextension2',
      selected: 'be', // Back Extensions
      options: getExercisesByCategory(EXERCISE_CATEGORIES.BACK_EXTENSION),
    },
    {
      id: EXERCISE_CATEGORIES.CALF_RAISE,
      selected: 'crm', // Calf Raise Machine
      options: getExercisesByCategory(EXERCISE_CATEGORIES.CALF_RAISE),
    },
  ],

  [MUSCLE_GROUPS.SHOULDERS]: [
    {
      id: EXERCISE_CATEGORIES.REAR_DELT_PRIMARY,
      selected: 'rdm', // Rear Delt Machine
      options: getExercisesByCategory(EXERCISE_CATEGORIES.REAR_DELT_PRIMARY),
    },
    {
      id: EXERCISE_CATEGORIES.LAT_RAISE_PRIMARY,
      selected: 'dlr', // Dumbbell Lat Raises
      options: getExercisesByCategory(EXERCISE_CATEGORIES.LAT_RAISE_PRIMARY),
    },
    {
      id: EXERCISE_CATEGORIES.REAR_DELT_SECONDARY,
      selected: 'oacrdf', // 1 Arm Cable Rear Delt Flys (using same exercises as primary)
      options: getExercisesByCategory(EXERCISE_CATEGORIES.REAR_DELT_PRIMARY),
    },
    {
      id: EXERCISE_CATEGORIES.LAT_RAISE_SECONDARY,
      selected: 'oacdlr', // 1 Arm Cable Lat Raises (using same exercises as primary)
      options: getExercisesByCategory(EXERCISE_CATEGORIES.LAT_RAISE_PRIMARY),
    },
    {
      id: EXERCISE_CATEGORIES.WRIST_CURL,
      selected: 'cwc', // Cable Wrist Curls w/ Bar
      options: getExercisesByCategory(EXERCISE_CATEGORIES.WRIST_CURL),
    },
    {
      id: EXERCISE_CATEGORIES.REVERSE_WRIST_CURL,
      selected: 'rdbwc', // Reverse Dumbbell Wrist Curls
      options: getExercisesByCategory(EXERCISE_CATEGORIES.REVERSE_WRIST_CURL),
    },
  ],
};

/**
 * Get default exercises for a muscle group
 */
export function getDefaultExercises(muscleGroup) {
  return DEFAULT_EXERCISES[muscleGroup] || [];
}
