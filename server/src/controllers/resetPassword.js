import connectNeonDB from "../db/connectNeonDB.js";
import bcrypt from "bcrypt";
import { createHttpError } from "../middleware/errorHandler.js";
import { PASSWORD_HASH_COST_FACTOR } from "../config/security.js";
import { logError } from "../util/logging.js";

export default async function resetPassword(req, res, next) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return next(createHttpError(400, "Missing token or password"));

  const { connectedClient, endConnection, error } = await connectNeonDB();

  if (error) {
    logError(`DB Connection Error: ${error}`);
    return next(createHttpError(503, "DB Connection Error"));
  }

  try {
    const result = await connectedClient.query(
      "SELECT id, reset_token_expires FROM users WHERE reset_token=$1",
      [token],
    );

    if (result.rows.length === 0)
      return next(createHttpError(400, "Invalid token"));

    const { id: user_id, reset_token_expires } = result.rows[0];

    if (new Date() > new Date(reset_token_expires))
      return next(createHttpError(400, "Token expired"));

    const hashed = await bcrypt.hash(newPassword, PASSWORD_HASH_COST_FACTOR);

    await connectedClient.query(
      "UPDATE users SET password=$1, reset_token=NULL, reset_token_expires=NULL WHERE id=$2",
      [hashed, user_id],
    );

    res.json({ success: true, msg: "Password updated" });
  } catch (err) {
    return next(createHttpError(500, "Server error"));
  } finally {
    await endConnection();
  }
}
