import connectNeonDB from "../db/connectNeonDB.js";
import getCachedJobsBySearchString from "../services/getCachedJobsBySearchString.js";
import rapidAPIfetchPersister from "../services/rapidAPIfetchPersister.js";
import apifyScraperFetchPersister from "../services/apifyScraperFetchPersister.js";
import { createHttpError } from "../middleware/errorHandler.js";
import { logError } from "../util/logging.js";

export default async function searchJobs(req, res, next) {
  let is_auth = req?.user?.id || null;

  const {
    connectedClient,
    error: connectionError,
    endConnection,
  } = await connectNeonDB();

  if (connectionError) {
    logError(`DB Connection Error: ${connectionError}`);
    return next(createHttpError(503, "DB Connection Error"));
  }

  try {
    let { search_string } = req.body;
    let aggregatedJobs = [];
    const aggregatedJobsIdsSet = new Set();

    if (typeof search_string !== "string" || !search_string.trim()) {
      return next(
        createHttpError(
          400,
          "You need to provide 'search_string' (non-empty string) in the request body.",
        ),
      );
    }

    search_string = search_string.toLowerCase();
    // is_whole_string parameter shows whether the previous search was performed for the whole string, part of it or not at all (undefined)
    const { is_whole_string, cachedJobsPerSearchString } =
      await getCachedJobsBySearchString(
        connectedClient,
        search_string,
        is_auth,
      );

    for (const job of cachedJobsPerSearchString) {
      if (!aggregatedJobsIdsSet.has(job.id)) {
        aggregatedJobs.push(job);
        aggregatedJobsIdsSet.add(job.id);
      }
    }

    const msg = apifyScraperFetchPersister(
      search_string,
      is_whole_string,
      is_auth,
    );

    const searchWords = search_string.split(/[\s\-/]+/).filter(Boolean);
    // If the same search was performed before, then the DB has already responded search_string which cannot be undefined, which means that it is worth to query the DB further only if the search string contains multiple words
    if (is_whole_string === undefined || searchWords.length > 1) {
      for (const searchWord of searchWords) {
        let { cachedJobsPerSearchString: fetchedJobs } =
          await getCachedJobsBySearchString(
            connectedClient,
            searchWord,
            is_auth,
          );
        if (fetchedJobs.length === 0) {
          fetchedJobs = await rapidAPIfetchPersister(searchWord, is_auth);
        }

        for (const job of fetchedJobs) {
          if (!aggregatedJobsIdsSet.has(job.id)) {
            aggregatedJobs.push(job);
            aggregatedJobsIdsSet.add(job.id);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      result: aggregatedJobs,
      msg,
    });
  } catch (error) {
    return next(
      createHttpError(
        500,
        "Unable to search for jobs, please try again later.",
      ),
    );
  } finally {
    if (endConnection) await endConnection();
  }
}
