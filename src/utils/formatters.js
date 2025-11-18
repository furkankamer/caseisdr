/**
 * Utility functions for formatting display values
 */

/**
 * Converts a number to its ordinal form (1st, 2nd, 3rd, etc.)
 * @param {number} num - The number to convert
 * @returns {string} The ordinal string (e.g., "1st", "2nd", "3rd")
 * @example
 * getOrdinal(1)  // "1st"
 * getOrdinal(2)  // "2nd"
 * getOrdinal(13) // "13th"
 * getOrdinal(21) // "21st"
 */
export const getOrdinal = (num) => {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
};