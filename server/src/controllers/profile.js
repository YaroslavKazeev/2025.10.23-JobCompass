import connectNeonDB from "../db/connectNeonDB.js";
import bcrypt from "bcrypt";
import { createHttpError } from "../middleware/errorHandler.js";
import { PASSWORD_HASH_COST_FACTOR } from "../config/security.js";
import { logError } from "../util/logging.js";
import mapUserFromJoinRows from "../util/map_user_details_with_favorites.js";
import { USER_FULL_INFO_QUERY } from "../constants/queries.js";

const ALLOWED_PROFILE_FIELDS = new Set([
  "first_name",
  "last_name",
  "street",
  "house_number",
  "city",
  "country",
  "skills",
]);

export default async function updateUserProfile(user_id, fieldsToUpdate) {
  const { currentPassword, newPassword, ...profileFields } = fieldsToUpdate;

  const providedProfileKeys = Object.keys(profileFields).filter(
    (key) => profileFields[key] !== undefined,
  );

  if (providedProfileKeys.includes("password")) {
    throw createHttpError(
      400,
      "Direct password updates are not allowed. Use currentPassword and newPassword.",
    );
  }

  const invalidProfileKeys = providedProfileKeys.filter(
    (key) => !ALLOWED_PROFILE_FIELDS.has(key),
  );

  if (invalidProfileKeys.length > 0) {
    throw createHttpError(
      400,
      `Invalid profile fields: ${invalidProfileKeys.join(", ")}`,
    );
  }

  const setParts = providedProfileKeys.map(
    (key, idx) => `${key} = $${idx + 1}`,
  );
  const values = providedProfileKeys.map((key) => {
    const value = profileFields[key];
    if (key === "skills") {
      if (Array.isArray(value)) return value.join(",");
      if (value === null) return null;
      return String(value);
    }
    return value;
  });

  const { connectedClient, endConnection, error } = await connectNeonDB();
  if (error) {
    logError(`DB Connection Error: ${error}`);
    throw createHttpError(503, "DB Connection Error");
  }

  try {
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        throw createHttpError(
          400,
          "To change your password, please fill in all fields.",
        );
      }

      const userResult = await connectedClient.query(
        "SELECT password FROM users WHERE id = $1",
        [user_id],
      );

      if (userResult.rows.length === 0) {
        throw createHttpError(404, "User not found");
      }

      const isMatch = await bcrypt.compare(
        currentPassword,
        userResult.rows[0].password,
      );

      if (!isMatch) {
        throw createHttpError(401, "Current password is incorrect");
      }

      const hashedPassword = await bcrypt.hash(
        newPassword,
        PASSWORD_HASH_COST_FACTOR,
      );
      setParts.push(`password = $${values.length + 1}`);
      values.push(hashedPassword);
    }

    if (setParts.length === 0) {
      throw createHttpError(400, "No fields provided to update");
    }

    values.push(user_id);
    const updateQuery = `
      UPDATE users
      SET ${setParts.join(", ")}
      WHERE id = $${values.length}
    `;

    await connectedClient.query(updateQuery, values);

    const fetchQuery = `${USER_FULL_INFO_QUERY} WHERE u.id = $1`;
    const result = await connectedClient.query(fetchQuery, [user_id]);

    if (result.rows.length === 0) {
      throw createHttpError(404, "User not found after update");
    }

    return mapUserFromJoinRows(result.rows);
  } finally {
    if (endConnection) await endConnection();
  }
}
