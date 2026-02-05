import persistJobSearch from "./persistJobSearch.js";
import { logError } from "../util/logging.js";
import rapidAPIfetch from "./rapidAPIfetch.js";
import cleanupInProgress from "../util/cleanupInProgress.js";

const inProgressRapidAPIfetch = {};

export default async function rapidAPIfetchPersister(searchWord, is_auth) {
  let fetchedJobs = [];
  cleanupInProgress(inProgressRapidAPIfetch, 3 * 60 * 1000);

  if (!inProgressRapidAPIfetch[searchWord]) {
    inProgressRapidAPIfetch[searchWord] = {
      is_auth,
      timestamp: Date.now(),
    };

    fetchedJobs = await rapidAPIfetch(searchWord, is_auth);

    (async () => {
      try {
        await persistJobSearch(fetchedJobs, searchWord, is_auth);
      } catch (error) {
        logError(
          `Background persistence failed for search term '${searchWord}': ${error.message}`,
        );
      } finally {
        delete inProgressRapidAPIfetch[searchWord];
      }
    })();
  }

  return fetchedJobs;
}
