import connectNeonDB from "../db/connectNeonDB.js";
import { logError } from "../util/logging.js";

export default async function cleanupDatabase() {
  const { error, connectedClient, endConnection } = await connectNeonDB();

  if (!error) {
    try {
      await connectedClient.query(
        "DELETE FROM search_strings WHERE search_date < NOW() - INTERVAL '1 week'",
      );
      await connectedClient.query(
        "DELETE FROM jobs WHERE date_posted < NOW() - INTERVAL '1 month' OR (date_posted < NOW() - INTERVAL '1 week' AND id NOT IN (SELECT job_id FROM user_favorites))",
      );
      await connectedClient.query(
        "DELETE FROM search_strings_jobs WHERE job_id NOT IN (SELECT id FROM jobs) OR search_string NOT IN (SELECT search_string FROM search_strings)",
      );
      await connectedClient.query(
        "DELETE FROM user_favorites WHERE job_id NOT IN (SELECT id FROM jobs) OR user_id NOT IN (SELECT id FROM users)",
      );
    } catch (error) {
      logError(`Unexpected error during database cleanup: ${error.message}`);
    } finally {
      await endConnection();
    }
  } else {
    logError(`DB connection error during database cleanup: ${error.message}`);
    if (endConnection) {
      await endConnection();
    }
  }
}
