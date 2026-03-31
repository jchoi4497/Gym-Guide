/**
 * Parse "145x12" format into weight and reps
 * @param {string} setString - String in format "weightxreps"
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
 * Combine weight and reps back to "145x12" format
 * @param {string} weight
 * @param {string} reps
 * @returns {string}
 */
export const combineSet = (weight, reps) => {
  const w = weight?.toString().trim() || '';
  const r = reps?.toString().trim() || '';

  if (!w && !r) return '';
  if (!w) return r; // Bodyweight - just reps
  if (!r) return w + 'x'; // Weight entered but no reps yet
  return `${w}x${r}`;
};

/**
 * Get previous set from setInputs array
 * @param {Array<string>} setInputs
 * @param {number} setIndex
 * @returns {string|null}
 */
export const getPreviousSet = (setInputs, setIndex) => {
  if (setIndex === 0 || !setInputs) return null;

  const previousSetString = setInputs[setIndex - 1];
  if (!previousSetString || previousSetString.trim() === '') return null;

  return previousSetString;
};

/**
 * Count filled sets
 * @param {Array<string>} setInputs
 * @returns {number}
 */
export const countFilledSets = (setInputs) => {
  if (!setInputs) return 0;
  return setInputs.filter(s => s && s.trim() !== '').length;
};
