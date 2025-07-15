export function parseWeightReps(input) {
  // check to see if x is included to see if proper format
  if (!input.includes('x')) return null;

  // split string by the x in middle and trim extra spaces if user made some
  const parts = input.split('x').map(str => str.trim());

  // if length is not two format is incorrect
  if (parts.length !== 2) return null;

  // parseInt 0 for weight and 1 for reps
  const weight = parseFloat(parts[0]);
  const reps = parseInt(parts[1]);

  // Check if either weight or reps failed to convert to a number.
  if (isNaN(weight) || isNaN(reps)) return null;

  // if everything is valid return these
  return {
    weight,
    reps,
    volume: weight * reps
  };
}
