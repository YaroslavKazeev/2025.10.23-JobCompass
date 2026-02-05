import { logError } from "../util/logging.js";
import connectNeonDB from "../db/connectNeonDB.js";

export default async function persistJobSearch(
  fetchedJobs,
  search_string,
  is_auth = null,
  is_whole_string = false,
) {
  const {
    connectedClient,
    error: connectionError,
    endConnection,
  } = await connectNeonDB();

  if (!connectionError) {
    const jobsToInsert = [];
    const searchStringJobsToInsert = [];

    await connectedClient.query("BEGIN");
    try {
      // Insert search string
      if (is_whole_string) {
        await connectedClient.query(
          "INSERT INTO search_strings (search_string, search_date, is_auth, is_whole_string) VALUES ($1, NOW(), $2, $3) ON CONFLICT (search_string) DO UPDATE SET search_date = NOW(), is_auth = $2, is_whole_string = $3",
          [search_string, is_auth, is_whole_string],
        );
      } else {
        await connectedClient.query(
          "INSERT INTO search_strings (search_string, search_date, is_auth) VALUES ($1, NOW(), $2) ON CONFLICT (search_string) DO UPDATE SET search_date = NOW(), is_auth = $2",
          [search_string, is_auth],
        );
      }

      // Process all jobs and collect data for batch operations
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      for (const job of fetchedJobs) {
        if (
          !Object.entries(job)
            .filter(
              ([key]) =>
                key !== "travel_time" &&
                key !== "least_transfers" &&
                key !== "work_mode",
            )
            .some(([, value]) => value === null) &&
          new Date(job.date_posted) >= oneMonthAgo
        ) {
          try {
            jobsToInsert.push(job);

            // Collect search_strings_jobs relationships
            searchStringJobsToInsert.push({
              search_string,
              jobId: job.id,
            });
          } catch (jobErr) {
            logError(`Error processing job ${job.id}: ${jobErr}`);
          }
        }
      }

      // Batch insert all jobs with ON CONFLICT handling
      if (jobsToInsert.length > 0) {
        const placeholders = jobsToInsert
          .map((_, i) => {
            const offset = i * 13;
            return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13})`;
          })
          .join(", ");

        const values = jobsToInsert.flatMap((job) => [
          job.id,
          job.date_posted,
          job.title,
          job.organization,
          job.organization_url,
          job.employment_type,
          job.url,
          job.organization_logo,
          job.display_location,
          job.work_mode,
          job.seniority,
          job.description_text,
          job.normalized_description,
        ]);

        const insertJobsQuery = `
        INSERT INTO jobs (
          id, date_posted, title, organization, organization_url,
          employment_type, url, organization_logo, display_location,
          work_mode, seniority, description_text, normalized_description
        ) VALUES ${placeholders}
        ON CONFLICT (id) DO UPDATE SET
          work_mode = CASE
            WHEN EXCLUDED.work_mode IS NOT NULL THEN EXCLUDED.work_mode
            ELSE jobs.work_mode
          END,
          description_text = CASE
            WHEN EXCLUDED.description_text ~ '<[^>]+>' THEN EXCLUDED.description_text
            ELSE jobs.description_text
          END
      `;

        await connectedClient.query(insertJobsQuery, values);
      }

      // Batch insert all search_strings_jobs relationships
      if (searchStringJobsToInsert.length > 0) {
        const placeholders = searchStringJobsToInsert
          .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
          .join(", ");

        const values = searchStringJobsToInsert.flatMap((rel) => [
          rel.search_string,
          rel.jobId,
        ]);

        const insertRelationsQuery = `
        INSERT INTO search_strings_jobs (search_string, job_id) VALUES ${placeholders}
        ON CONFLICT DO NOTHING
      `;

        await connectedClient.query(insertRelationsQuery, values);
      }

      await connectedClient.query("COMMIT");
    } catch (error) {
      await connectedClient.query("ROLLBACK");
      logError(`Transaction error: ${error}`);
    }
  }

  if (endConnection) await endConnection();
}
