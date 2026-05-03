/**
 * Cleans up old entries from in-progress tracking objects
 * @param {Object} inProgressSearch - Object tracking word-based fetches

 */
export default function cleanupInProgress(inProgressSearch, expirationTime) {
  const currentTime = Date.now();

  // Clean up inProgressSearch object from older entries
  for (const key in inProgressSearch) {
    if (currentTime - inProgressSearch[key].timestamp > expirationTime) {
      delete inProgressSearch[key];
    }
  }
}
