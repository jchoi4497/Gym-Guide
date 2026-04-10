/**
 * Weight conversion utilities
 * All weights are stored in lbs in Firebase
 * Display/input conversion happens based on user preference
 */

const LBS_TO_KG = 0.453592;
const KG_TO_LBS = 2.20462;

/**
 * Convert weight from lbs to kg
 */
export const lbsToKg = (lbs) => {
  if (!lbs || lbs === '') return '';
  const kg = parseFloat(lbs) * LBS_TO_KG;
  return Math.round(kg * 10) / 10; // Round to 1 decimal
};

/**
 * Convert weight from kg to lbs
 */
export const kgToLbs = (kg) => {
  if (!kg || kg === '') return '';
  const lbs = parseFloat(kg) * KG_TO_LBS;
  return Math.round(lbs * 10) / 10; // Round to 1 decimal
};

/**
 * Convert weight for display based on user's unit preference
 * @param {string|number} weightInLbs - Weight stored in lbs
 * @param {string} userUnit - User's preferred unit ('lbs' or 'kg')
 * @returns {string|number} Converted weight
 */
export const displayWeight = (weightInLbs, userUnit) => {
  if (!weightInLbs || weightInLbs === '') return '';
  if (userUnit === 'kg') {
    return lbsToKg(weightInLbs);
  }
  return weightInLbs;
};

/**
 * Convert weight for saving to Firebase (always save as lbs)
 * @param {string|number} weight - Weight from user input
 * @param {string} userUnit - User's current unit ('lbs' or 'kg')
 * @returns {string|number} Weight in lbs for storage
 */
export const saveWeight = (weight, userUnit) => {
  if (!weight || weight === '') return '';
  if (userUnit === 'kg') {
    return kgToLbs(weight);
  }
  return weight;
};
