/**
 * Set Parsing & Manipulation Utilities
 * Consolidates all logic for handling "145x12" format sets
 */

/**
 * Parse set string into weight and reps object
 * @param {string} setString - Format: "145x12" or "12" (bodyweight)
 * @returns {{weight: string, reps: string}}
 */
export const parseSet = (setString) => {
  if (!setString || setString.trim() === '') {
    return { weight: '', reps: '' };
  }

  if (setString.includes('x')) {
    const [weight, reps] = setString.split('x').map(s => s.trim());
    return { weight: weight || '', reps: reps || '' };
  }

  // Bodyweight (just reps, no weight)
  return { weight: '', reps: setString.trim() };
};

/**
 * Combine weight and reps into set string
 * @param {string} weight
 * @param {string} reps
 * @returns {string} - Format: "145x12" or "12" (bodyweight)
 */
export const combineSet = (weight, reps) => {
  const w = weight.trim();
  const r = reps.trim();

  if (!w && !r) return '';
  if (!w) return r; // Bodyweight - just reps
  if (!r) return w + 'x'; // Weight entered but no reps yet
  return `${w}x${r}`;
};

/**
 * Check if a set has any data
 * @param {string} setString
 * @returns {boolean}
 */
export const hasSetData = (setString) => {
  if (!setString) return false;
  const { weight, reps } = parseSet(setString);
  return Boolean(weight || reps);
};

/**
 * Copy previous set data
 * @param {Array<string>} sets - Array of set strings
 * @param {number} currentIndex - Index of current set
 * @returns {string|null} - Previous set string or null if not available
 */
export const getPreviousSet = (sets, currentIndex) => {
  if (currentIndex === 0 || !sets || sets.length === 0) return null;

  const previousSet = sets[currentIndex - 1];
  return hasSetData(previousSet) ? previousSet : null;
};

/**
 * Count filled sets in array
 * @param {Array<string>} sets
 * @returns {number}
 */
export const countFilledSets = (sets) => {
  if (!sets || !Array.isArray(sets)) return 0;
  return sets.filter(hasSetData).length;
};

/**
 * Parse weight/reps for calculations (returns numbers)
 * @param {string} input - Format: "145x12"
 * @returns {{weight: number, reps: number, volume: number}|null}
 */
export const parseSetForCalculations = (input) => {
  if (typeof input !== 'string') return null;

  if (input.includes('x')) {
    const parts = input.split('x').map(str => str.trim());
    if (parts.length !== 2) return null;

    const weight = parseFloat(parts[0]);
    const reps = parseInt(parts[1]);
    if (isNaN(weight) || isNaN(reps)) return null;

    return {
      weight,
      reps,
      volume: weight * reps
    };
  }

  // Bodyweight - treat as reps only
  const reps = parseInt(input.trim());
  if (isNaN(reps)) return null;

  return {
    weight: 0,
    reps,
    volume: reps
  };
};

/**
 * Calculate total volume for an exercise
 * @param {Array<string>} sets
 * @returns {number}
 */
export const calculateExerciseVolume = (sets) => {
  if (!sets || !Array.isArray(sets)) return 0;

  return sets.reduce((total, set) => {
    const parsed = parseSetForCalculations(set);
    return total + (parsed?.volume || 0);
  }, 0);
};
