/**
 * Retrieves cached job listings associated with a given search string from the database.
 *
 * This function queries the database to check if a search string exists and, if found,
 * retrieves all jobs that have been cached for that particular search term. It supports
 * both whole string and partial matches, and respects authentication requirements.
 *
 * @async
 * @param {string|null} is_auth - Authentication context identifier used to decide
 *                                 whether cache entries created from an authenticated
 *                                 search may be used. If null, any cache entry for the
 *                                 search string may be returned. If provided, only cache
 *                                 entries whose stored search_string has a non-null
 *                                 `ss.is_auth` are eligible.
 *
 * @returns {Promise<{is_whole_string: (boolean|undefined), cachedJobsPerSearchString: Object[]}>}
 * A promise that resolves to the cached search result object.
 * @property {(boolean|undefined)} is_whole_string - Indicates whether the cached
 * search string represents a whole string match (`true`) or partial match (`false`).
 * Returns `undefined` if the search string is not found in cache.
 * @property {Object[]} cachedJobsPerSearchString - Array of job objects matching the
 * search string. Each job object contains all columns from the `jobs` table. Returns an
 * empty array if no matching jobs are found or if the search string does not exist.
 *
 * @example
 * const result = await getCachedJobsBySearchString(dbClient, 'React Developer', userId);
 * console.log(result.is_whole_string); // true or false
 * console.log(result.cachedJobsPerSearchString); // Array of job objects
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
    // This query joins three tables to get all jobs associated with a search string:
    // 1. Selects all job columns (j.*)
    // 2. Joins with search_strings_jobs to find which jobs match the search string
    // 3. Joins with search_strings to access auth requirements
    // 4. Filters by: the specific search string ($1)
    //    AND either: is_auth from the user is NULL (unauthenticated) OR is_auth from the search string table is not NULL (authenticated previous search)
    // It forces the function not to return jobs for the authenticated user if the previous search was performed by an unauthenticated user, otherwise the number of jobs will be too few for the authenticated user
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
