import { SET_RANGE_OPTIONS } from '../config/constants';

/**
 * Get the display rep count for a workout
 * Handles backward compatibility for workouts created before customRepCount was saved
 *
 * @param {Object} workout - The workout object
 * @returns {string|number} - The rep count (e.g., 12 or "8-12")
 */
export function getWorkoutRepCount(workout) {
  if (!workout) return '8-12';

  // First check if customRepCount is explicitly saved
  if (workout.customRepCount) {
    return workout.customRepCount;
  }

  // If no customRepCount, check if numberOfSets matches a preset option
  if (workout.numberOfSets) {
    const preset = SET_RANGE_OPTIONS.find(opt => opt.value === workout.numberOfSets);
    if (preset && preset.reps) {
      return preset.reps;
    }
  }

  // Default fallback
  return '8-12';
}

/**
 * Get the display set count for a workout
 *
 * @param {Object} workout - The workout object
 * @returns {number|string} - The set count
 */
export function getWorkoutSetCount(workout) {
  if (!workout) return 4;
  return workout.customSetCount || workout.numberOfSets || 4;
}

/**
 * Get formatted sets x reps display string
 *
 * @param {Object} workout - The workout object
 * @returns {string} - Formatted string like "4x12"
 */
export function getWorkoutSetsRepsDisplay(workout) {
  const sets = getWorkoutSetCount(workout);
  const reps = getWorkoutRepCount(workout);
  return `${sets}x${reps}`;
}
