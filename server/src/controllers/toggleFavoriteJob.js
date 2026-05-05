import connectNeonDB from "../db/connectNeonDB.js";
import { createHttpError } from "../middleware/errorHandler.js";
import { logError } from "../util/logging.js";
import mapUserFromJoinRows from "../util/map_user_details_with_favorites.js";
import { USER_FULL_INFO_QUERY } from "../constants/queries.js";

export default async function toggleFavoriteJob(req, res, next) {
  const user_id = req.user?.id;
  const { job } = req.body;
  const jobId = job?.id;

  //  Check if user is authenticated
  if (!user_id) return next(createHttpError(401, "User not authenticated"));

  //  Validate job object
  const requiredFields = [
    "id",
    "title",
    "organization",
    "organization_url",
    "employment_type",
    "url",
    "organization_logo",
    "display_location",
    "seniority",
    "description_text",
    "date_posted",
    "normalized_description",
  ];

  if (!job) {
    return next(createHttpError(400, "Invalid job: job object is required"));
  }

  for (const field of requiredFields) {
    if (job[field] === undefined || job[field] === null) {
      return next(createHttpError(400, `Invalid job: ${field} is required`));
    }
  }

  const { connectedClient, endConnection, error } = await connectNeonDB();

  //  Handle database connection error
  if (error) {
    logError(`DB Connection Error: ${error}`);
    return next(createHttpError(503, "DB Connection Error"));
  }

  try {
    await connectedClient.query("BEGIN");

    // 1 Insert core job data if it does not exist (atomically)
    await connectedClient.query(
      `INSERT INTO jobs 
        (id, title, organization, organization_url, employment_type, url, 
         organization_logo, display_location, work_mode, seniority, description_text,
         date_posted, normalized_description)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO NOTHING`,
      [
        jobId,
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
        job.date_posted,
        job.normalized_description,
      ],
    );

    // 2 Check if this favorite exists for this user
    const exists = await connectedClient.query(
      "SELECT 1 FROM user_favorites WHERE user_id = $1 AND job_id = $2",
      [user_id, jobId],
    );

    let action;
    if (exists.rows.length > 0) {
      // 3 Remove favorite
      await connectedClient.query(
        "DELETE FROM user_favorites WHERE user_id = $1 AND job_id = $2",
        [user_id, jobId],
      );
      action = "removed";
    } else {
      // 4 Add favorite
      await connectedClient.query(
        "INSERT INTO user_favorites (user_id, job_id, adding_date, travel_time, least_transfers) VALUES ($1, $2, NOW(), $3, $4)",
        [user_id, jobId, job.travel_time, job.least_transfers],
      );
      action = "added";
    }

    // 5 Fetch the updated user favorites list
    const result = await connectedClient.query(
      `${USER_FULL_INFO_QUERY} WHERE u.id = $1`,
      [user_id],
    );

    await connectedClient.query("COMMIT");

    if (result.rows.length === 0) {
      return next(createHttpError(404, "User not found"));
    }
    const updatedUser = mapUserFromJoinRows(result.rows);

    return res.status(200).json({
      success: true,
      action,
      favorites: updatedUser.favorites,
    });
  } catch (err) {
    try {
      await connectedClient.query("ROLLBACK");
    } catch (rollbackError) {
      logError(`Rollback error in toggleFavoriteJob: ${rollbackError}`);
    }
    logError(`Error in toggleFavoriteJob: ${err}`);
    return next(createHttpError(500, "Failed to toggle favorite"));
  } finally {
    if (endConnection) await endConnection();
  }
}
