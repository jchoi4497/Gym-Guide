export function parseWeightReps(input) {
  if (typeof input !== 'string') return null;

  // If input contains 'x', parse as weight x reps
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

  // Otherwise, treat input as reps only (bodyweight)
  const reps = parseInt(input.trim());
  if (isNaN(reps)) return null;

  // For bodyweight exercises, set weight to 1 (or whatever you prefer)
  return {
    weight: 1,
    reps,
    volume: reps
  };
}

