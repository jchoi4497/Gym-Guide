import { EXERCISE_CATEGORIES } from '../config/exerciseConfig';

/**
 * Detect exercise category from exercise name using keywords
 * Returns category ID or null if no match found
 */
export function detectCategoryFromName(exerciseName) {
  if (!exerciseName) return null;

  const nameLower = exerciseName.toLowerCase();

  // Category detection rules (order matters - more specific first)
  const rules = [
    // Chest
    { keywords: ['incline press', 'incline bench'], category: EXERCISE_CATEGORIES.INCLINE_PRESS },
    { keywords: ['chest press', 'chestpress', 'bench press', 'bench'], category: EXERCISE_CATEGORIES.CHEST_PRESS },
    { keywords: ['chest fly', 'chestfly', 'pec fly', 'cable fly', 'flys', 'flyes'], category: EXERCISE_CATEGORIES.CHEST_FLY },
    { keywords: ['tricep', 'pushdown', 'triceps', 'dips', 'skull crusher'], category: EXERCISE_CATEGORIES.TRICEP_PRIMARY },

    // Back
    { keywords: ['pull up', 'pullup', 'chin up', 'chinup', 'pullups'], category: EXERCISE_CATEGORIES.PULLUP },
    { keywords: ['row', 'rows'], category: EXERCISE_CATEGORIES.ROW },
    { keywords: ['lat pull', 'pulldown', 'latpull'], category: EXERCISE_CATEGORIES.LAT_PULLDOWN },
    { keywords: ['bicep', 'biceps', 'curl', 'curls'], category: EXERCISE_CATEGORIES.BICEP_PRIMARY },

    // Legs
    { keywords: ['squat', 'leg press', 'legpress'], category: EXERCISE_CATEGORIES.SQUAT },
    { keywords: ['split squat', 'bulgarian', 'lunge', 'leg curl', 'legcurl', 'hack squat'], category: EXERCISE_CATEGORIES.SPLIT_SQUAT },
    { keywords: ['deadlift', 'rdl', 'romanian', 'back extension', 'good morning', 'goodmorning'], category: EXERCISE_CATEGORIES.BACK_EXTENSION },
    { keywords: ['calf raise', 'calfraise', 'calf'], category: EXERCISE_CATEGORIES.CALF_RAISE },

    // Shoulders
    { keywords: ['shoulder press', 'shoulderpress', 'overhead press', 'military press'], category: EXERCISE_CATEGORIES.SHOULDER_PRESS },
    { keywords: ['rear delt', 'reardelt', 'reverse fly', 'face pull', 'facepull'], category: EXERCISE_CATEGORIES.REAR_DELT_PRIMARY },
    { keywords: ['lateral raise', 'lateralraise', 'side raise', 'lat raise', 'latraise'], category: EXERCISE_CATEGORIES.LAT_RAISE_PRIMARY },
    { keywords: ['front raise', 'frontraise'], category: EXERCISE_CATEGORIES.FRONT_RAISE },
    { keywords: ['wrist curl', 'wristcurl'], category: EXERCISE_CATEGORIES.WRIST_CURL },

    // Cardio
    { keywords: ['treadmill', 'running', 'run', 'jog', 'jogging', 'sprint'], category: EXERCISE_CATEGORIES.CARDIO },
    { keywords: ['bike', 'cycling', 'cycle', 'biking'], category: EXERCISE_CATEGORIES.CARDIO },
    { keywords: ['elliptical'], category: EXERCISE_CATEGORIES.CARDIO },
    { keywords: ['stair', 'stairmaster'], category: EXERCISE_CATEGORIES.CARDIO },
    { keywords: ['jump', 'jumping jack', 'burpee', 'mountain climber'], category: EXERCISE_CATEGORIES.CARDIO },

    // Abs
    { keywords: ['crunch', 'sit up', 'situp', 'ab', 'abs', 'plank', 'leg raise', 'legraise'], category: EXERCISE_CATEGORIES.ABS },
  ];

  // Find first matching rule
  for (const rule of rules) {
    if (rule.keywords.some(keyword => nameLower.includes(keyword))) {
      return rule.category;
    }
  }

  return null; // No category detected
}

/**
 * Get muscle group from category
 */
export function getMuscleGroupFromCategory(category) {
  const categoryToMuscleGroup = {
    // Chest
    [EXERCISE_CATEGORIES.INCLINE_PRESS]: 'chest',
    [EXERCISE_CATEGORIES.CHEST_PRESS]: 'chest',
    [EXERCISE_CATEGORIES.CHEST_FLY]: 'chest',
    [EXERCISE_CATEGORIES.TRICEP_PRIMARY]: 'chest',
    [EXERCISE_CATEGORIES.TRICEP_SECONDARY]: 'chest',

    // Back
    [EXERCISE_CATEGORIES.PULLUP]: 'back',
    [EXERCISE_CATEGORIES.ROW]: 'back',
    [EXERCISE_CATEGORIES.LAT_PULLDOWN]: 'back',
    [EXERCISE_CATEGORIES.BICEP_PRIMARY]: 'back',
    [EXERCISE_CATEGORIES.BICEP_SECONDARY]: 'back',

    // Legs
    [EXERCISE_CATEGORIES.SQUAT]: 'legs',
    [EXERCISE_CATEGORIES.SPLIT_SQUAT]: 'legs',
    [EXERCISE_CATEGORIES.BACK_EXTENSION]: 'legs',
    [EXERCISE_CATEGORIES.CALF_RAISE]: 'legs',

    // Shoulders
    [EXERCISE_CATEGORIES.SHOULDER_PRESS]: 'shoulders',
    [EXERCISE_CATEGORIES.REAR_DELT_PRIMARY]: 'shoulders',
    [EXERCISE_CATEGORIES.REAR_DELT_SECONDARY]: 'shoulders',
    [EXERCISE_CATEGORIES.LAT_RAISE_PRIMARY]: 'shoulders',
    [EXERCISE_CATEGORIES.LAT_RAISE_SECONDARY]: 'shoulders',
    [EXERCISE_CATEGORIES.FRONT_RAISE]: 'shoulders',
    [EXERCISE_CATEGORIES.WRIST_CURL]: 'shoulders',
    [EXERCISE_CATEGORIES.REVERSE_WRIST_CURL]: 'shoulders',

    // Cardio
    [EXERCISE_CATEGORIES.CARDIO]: 'cardio',

    // Abs
    [EXERCISE_CATEGORIES.ABS]: 'core',
  };

  return categoryToMuscleGroup[category] || null;
}
