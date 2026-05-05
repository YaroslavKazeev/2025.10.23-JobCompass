import connectNeonDB from "../db/connectNeonDB.js";
import { createHttpError } from "../middleware/errorHandler.js";
import { logError } from "../util/logging.js";

export default async function deleteUser(req, res, next) {
  // This API endpoint is secured via `verifyToken` middleware,
  // ensuring the request is authenticated.

  // We strictly enforce "Self-Deletion" by using the user ID extracted
  // from the token payload (req.user.id) as the target ID.
  const targetUserId = req.user.id;

  // --- ID Validation Check ---
  if (!targetUserId) {
    // If the authenticated token somehow lacks a valid ID payload, respond with 401.
    // This suggests an issue with the token payload itself.
    return next(
      createHttpError(
        401,
        "Authentication failed: No valid User ID found in token.",
      ),
    );
  }

  // Connect to the database
  const { error, connectedClient, endConnection } = await connectNeonDB();
  if (error) {
    logError(`DB Connection Error: ${error}`);
    return next(createHttpError(503, "DB Connection Error"));
  }

  try {
    // Delete the user record using the ID from the token
    const query = "DELETE FROM users WHERE id = $1 RETURNING *";
    const result = await connectedClient.query(query, [targetUserId]);

    if (result.rowCount === 0) {
      return next(createHttpError(404, "User not found (or already deleted)"));
    }

    // Successfully deleted
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      deletedUser: result.rows,
    });
  } catch (err) {
    return next(createHttpError(500, "Internal server error"));
  } finally {
    await endConnection();
  }
}
