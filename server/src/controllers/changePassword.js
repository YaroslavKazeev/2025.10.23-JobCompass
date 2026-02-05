// controllers/changePassword.js
import connectNeonDB from "../db/connectNeonDB.js";
import bcrypt from "bcrypt";
import { logError } from "../util/logging.js";

export default async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user_id = req.user?.id;

  if (!user_id || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, msg: "Missing fields" });
  }

  const { connectedClient, error, endConnection } = await connectNeonDB();
  if (error)
    return res.status(500).json({ success: false, msg: error.message });

  try {
    const result = await connectedClient.query(
      "SELECT * FROM users WHERE id = $1",
      [user_id],
    );
    const user = result.rows[0];

    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, msg: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await connectedClient.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, user_id],
    );

    res.json({ success: true, msg: "Password updated successfully" });
  } catch (err) {
    logError(err);
    res.status(500).json({ success: false, msg: "Server error" });
  } finally {
    await endConnection();
  }
}
