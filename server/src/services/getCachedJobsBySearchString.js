/*
Job Search Integration & Caching Implementation:
- Multi-API Integration: LinkedIn jobs via RapidAPI and Apify scraper
- Intelligent Caching: Authentication-aware caching with automatic cleanup
- Search Optimization: Word-by-word processing for better result coverage
- Data Normalization: Standardized job data from multiple sources
- Cache Strategy: Authentication-aware result retrieval with privacy protection
- Performance: Efficient database queries with proper joins and filtering
- Analytics Foundation: Supports search pattern analysis and user behavior tracking
*/

/**
 * Retrieves cached jobs from the database for a given search word
 * @param {Object} connectedClient - Database client connection
 * @param {string} searchWord - The search word to look up
 * @param {string|null} is_auth - Optional user identifier (uuid used as a boolean-ish flag for authenticated requests now, retained for future search analytics); leave null/undefined for anonymous lookups
 * @returns {Promise<Object>} Object containing is_whole_string and cachedJobsPerSearchString array
 */
export default async function getCachedJobsBySearchString(
  connectedClient,
  searchWord,
  is_auth,
) {
  let cachedResult = {
    is_whole_string: undefined,
    cachedJobsPerSearchString: [],
  };
  // Check if the search word exists in search_strings table
  const checkWordResult = await connectedClient.query(
    "SELECT search_string, is_whole_string FROM search_strings WHERE search_string = $1",
    [searchWord],
  );
  if (checkWordResult.rows.length > 0) {
    const isWholeString = checkWordResult.rows[0].is_whole_string;

    // Retrieve cached jobs
    const cachedJobsResult = await connectedClient.query(
      `SELECT j.* FROM jobs j
       JOIN search_strings_jobs swj ON j.id = swj.job_id
       JOIN search_strings ss ON swj.search_string = ss.search_string
       WHERE swj.search_string = $1 AND ($2::uuid IS NULL OR ss.is_auth IS NOT NULL)`,
      [searchWord, is_auth],
    );

    cachedResult = {
      is_whole_string: isWholeString,
      cachedJobsPerSearchString: cachedJobsResult.rows,
    };
  }
  return cachedResult;
}
