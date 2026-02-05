import persistJobSearch from "./persistJobSearch.js";
import { logError } from "../util/logging.js";
import linkedInScraperFetch from "./linkedInScraperFetch.js";
import cleanupInProgress from "../util/cleanupInProgress.js";

const inProgressScraperFetch = {};

export default function apifyScraperFetchPersister(
  search_string,
  is_whole_string,
  is_auth,
) {
  cleanupInProgress(inProgressScraperFetch, 20 * 60 * 1000);

  // Check if conditions are met before proceeding
  if (!is_whole_string && is_auth && !inProgressScraperFetch[search_string]) {
    inProgressScraperFetch[search_string] = {
      timestamp: Date.now(),
    };

    (async () => {
      try {
        const fetchedJobs = await linkedInScraperFetch(search_string);
        await persistJobSearch(
          fetchedJobs,
          search_string,
          is_auth,
          true, // is_whole_string
        );
      } catch (error) {
        logError(
          `Background fetch failed for search term '${search_string}': ${error.message}`,
        );
      } finally {
        delete inProgressScraperFetch[search_string];
      }
    })();

    return "New vacancies will be available in our DB in 1-10 min; search for the same job title to find them.";
  } else {
    return "";
  }
}
