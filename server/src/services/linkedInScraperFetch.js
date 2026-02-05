import { logInfo, logError } from "../util/logging.js";
import processScraperJob from "../util/processScraperJob.js";

/*
Apify LinkedIn Scraper Integration Details:
- Service: Apify LinkedIn Jobs Scraper
- Background Processing: Asynchronous execution for authenticated users
- Enhanced Data: Company information and detailed job descriptions
- Polling: Status monitoring with configurable timeouts (30s intervals, 10min timeout)
- Data Processing: Job validation and normalization through processScraperJob utility
- Error Handling: Comprehensive error logging and status monitoring
- Reliability: Robust polling mechanism with timeout protection
*/
const apifyBase = "https://api.apify.com/v2";
const pollIntervalMs = 30 * 1000;
const waitTimeoutMs = 10 * 60 * 1000;
if (!process.env.LINKEDIN_SCRAPER_KEY) {
  throw new Error("LINKEDIN_SCRAPER_KEY environment variable is not set");
}

export default async function linkedInScraperFetch(
  search_string,
  location = "Netherlands",
) {
  const aggregated = [];
  const token = process.env.LINKEDIN_SCRAPER_KEY;
  const startUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(search_string)}&location=${encodeURIComponent(location)}`;
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    // Start scraper run
    const startRunUrl = `${apifyBase}/acts/curious_coder~linkedin-jobs-scraper/runs`;
    const requestBody = {
      urls: [startUrl],
      scrapeCompany: true,
    };
    const startResponse = await fetch(startRunUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    if (!startResponse.ok) throw new Error("Failed to start LinkedIn scraper");
    const startResp = await startResponse.json();

    const runId = startResp?.data?.id;
    if (!runId) {
      throw new Error("Unable to determine run id from start response");
    }
    const runUrl = `${apifyBase}/acts/curious_coder~linkedin-jobs-scraper/runs/${encodeURIComponent(
      runId,
    )}`;

    // Polling requests for completion
    const startTime = Date.now();
    let polling = true;

    while (polling) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      const response = await fetch(runUrl, { headers });
      if (!response.ok) throw new Error("Failed to fetch run status");
      const run = await response.json();
      const runStatus = run?.data?.status;
      logInfo(`Run ${runId} for ${search_string} status: ${runStatus}`);
      switch (runStatus) {
        case "SUCCEEDED":
          polling = false;
          break;
        case "FAILED":
        case "ABORTED":
          throw new Error(
            `The run ${runId} for ${search_string} has finished with status ${runStatus}`,
          );
      }
      if (Date.now() - startTime > waitTimeoutMs) {
        throw new Error(
          `The waiting time for ${runId} for ${search_string} has expired`,
        );
      }
    }

    // Collecting the data
    const dataFetchUrl = `${apifyBase}/actor-runs/${encodeURIComponent(
      runId,
    )}/dataset/items?format=json`;
    const response = await fetch(dataFetchUrl, { headers });
    if (!response.ok) throw new Error("Failed to fetch dataset items");
    const results = await response.json();

    if (Array.isArray(results)) {
      aggregated.push(
        ...results
          .map((job) => processScraperJob(job))
          .filter((job) => job !== null),
      );
    } else {
      throw new Error(
        `Unexpected API response shape: ${JSON.stringify(results)}`,
      );
    }
  } catch (error) {
    logError(`linkedInScraperFetch error: ${error}`);
  }

  return aggregated;
}
