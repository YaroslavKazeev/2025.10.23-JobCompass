import connectNeonDB from "../db/connectNeonDB.js";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import { createHttpError } from "../middleware/errorHandler.js";
import { logError } from "../util/logging.js";

// transporter Gmail App Password
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp.gmail.com
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Gmail App Password
  },
});

export default async function forgotPassword(req, res, next) {
  const { email } = req.body;

  if (!email) return next(createHttpError(400, "Email required"));

  const { connectedClient, endConnection, error } = await connectNeonDB();
  if (error) {
    logError(`DB Connection Error: ${error}`);
    return next(createHttpError(503, "DB Connection Error"));
  }

  try {
    const result = await connectedClient.query(
      "SELECT id FROM users WHERE email=$1",
      [email],
    );
    if (result.rows.length === 0) {
      return next(createHttpError(404, "Email not found"));
    }

    const user_id = result.rows[0].id;

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes

    await connectedClient.query(
      "UPDATE users SET reset_token=$1, reset_token_expires=$2 WHERE id=$3",
      [token, expiresAt, user_id],
    );

    const frontendUrl = process.env.VITE_FRONTEND_URL;
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Job Compass" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset your Job Compass password",
      html: `
        <p>Hello!</p>
        <p>You requested a password reset for Job Compass.</p>
        <p>Click this link to reset your password (valid 10 minutes):</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.json({ success: true, msg: "Reset link sent to email" });
  } catch (err) {
    return next(createHttpError(500, "Server error"));
  } finally {
    await endConnection();
  }
}
