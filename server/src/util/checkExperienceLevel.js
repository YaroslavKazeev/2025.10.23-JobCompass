/**
 * Checks whether a string contains 'junior' or 'senior' keywords (case-insensitive)
 * and returns the appropriate experience level classification.
 *
 * @param {string} text - The text to analyze for experience level keywords
 * @returns {string} - Returns 'Entry level' for junior, 'Mid-Senior level' for senior,
 *                     or 'Not applicable' if neither is found
 */
export default function checkExperienceLevel(text) {
  if (!text || typeof text !== "string") {
    return "Not applicable";
  }

  const lowerText = text.toLowerCase();

  if (lowerText.includes("junior")) {
    return "Entry level";
  }

  if (lowerText.includes("senior")) {
    return "Mid-Senior level";
  }

  return "Not applicable";
}
