import { logError } from "../util/logging.js";
import connectNeonDB from "../db/connectNeonDB.js";
import getCachedJobsBySearchString from "../services/getCachedJobsBySearchString.js";
import rapidAPIfetchPersister from "../services/rapidAPIfetchPersister.js";
import apifyScraperFetchPersister from "../services/apifyScraperFetchPersister.js";

export default async function searchJobs(req, res) {
  let is_auth = req?.user?.id || null;

  const {
    connectedClient,
    error: connectionError,
    endConnection,
  } = await connectNeonDB();

  let responseStatus = 200;
  let responseData = { success: true, result: [], msg: "" };

  if (connectionError) {
    responseStatus = 500;
    responseData = {
      success: false,
      msg: `DB Connection Error: ${connectionError}`,
    };
  } else {
    try {
      let { search_string } = req.body;
      let aggregatedJobs = [];
      const aggregatedJobsIdsSet = new Set();

      if (typeof search_string !== "string" || !search_string.trim()) {
        responseStatus = 400;
        responseData = {
          ...responseData,
          success: false,
          msg: "You need to provide 'search_string' (non-empty string) in the request body.",
        };
      } else {
        search_string = search_string.toLowerCase();
        const { is_whole_string, cachedJobsPerSearchString } =
          await getCachedJobsBySearchString(
            connectedClient,
            search_string,
            is_auth,
          );

        if (cachedJobsPerSearchString.length > 0) {
          cachedJobsPerSearchString.forEach((job) => {
            aggregatedJobs.push(job);
            if (job.id) aggregatedJobsIdsSet.add(job.id);
          });
        }

        responseData.msg = apifyScraperFetchPersister(
          search_string,
          is_whole_string,
          is_auth,
        );

        const searchWords = search_string.split(/[\s\-/]+/).filter(Boolean);
        // If the DB has already responded with the job title which is the single keyword, there's no need to break it down further and re-query for the same keyword.
        if (is_whole_string === undefined || searchWords.length > 1) {
          for (let i = 0; i < searchWords.length; i++) {
            const searchWord = searchWords[i];
            const cachedResult = await getCachedJobsBySearchString(
              connectedClient,
              searchWord,
              is_auth,
            );
            let fetchedJobs = [];
            if (cachedResult.cachedJobsPerSearchString.length > 0) {
              fetchedJobs = [...cachedResult.cachedJobsPerSearchString];
            } else {
              fetchedJobs = await rapidAPIfetchPersister(searchWord, is_auth);
            }

            for (const job of fetchedJobs) {
              if (job.id && !aggregatedJobsIdsSet.has(job.id)) {
                aggregatedJobs.push(job);
                aggregatedJobsIdsSet.add(job.id);
              }
            }
          }
        }

        responseData = {
          ...responseData,
          success: true,
          result: aggregatedJobs,
        };
      }
    } catch (error) {
      logError(`searchJobs error: ${error}`);
      responseStatus = 500;
      responseData = {
        success: false,
        msg: "Unable to search for jobs, please try again later.",
      };
    }
  }
  if (endConnection) await endConnection();
  res.status(responseStatus).json(responseData);
}
