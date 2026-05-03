import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectNeonDB from "../db/connectNeonDB.js";
import { v4 as uuidv4 } from "uuid";

import validationErrorMessage from "../util/validationErrorMessage.js";
import { blacklistedTokens } from "../middleware/authVerify.js";
import validateUserRegistration from "../util/validateUserRegistration.js";
import updateUserProfile from "./profile.js";
import uploadImage from "../services/ImageUpload.js";
import { createHttpError } from "../middleware/errorHandler.js";
import { logError } from "../util/logging.js";
import mapUserFromJoinRows from "../util/map_user_details_with_favorites.js";
import { USER_FULL_INFO_QUERY } from "../constants/queries.js";

/*
Personalization Features Implementation:
- User Profiles: Skills, location, and preference management
- Favorites System: Save jobs with personalized commute calculations
- Commute Integration: Google Maps API for travel time calculations
- Avatar Upload: Firebase integration for profile images
- Profile Management: Comprehensive user data handling with validation
- Security: Password hashing, JWT tokens, and secure session management
- Data Privacy: Proper handling of user data with authentication checks
*/

// JWT Configuration

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// SIGNUP - Create a new user

export async function createUser(req, res, next) {
  const { connectedClient, endConnection, error } = await connectNeonDB();
  if (error) {
    logError(`DB Connection Error: ${error}`);
    return next(createHttpError(503, "DB Connection Error"));
  }

  try {
    const user = req.body?.user || {};
    const { valid, errors } = validateUserRegistration(user);

    if (!valid) {
      return next(createHttpError(400, validationErrorMessage(errors)));
    }

    const checkEmail = await connectedClient.query(
      "SELECT id FROM users WHERE email = $1",
      [user.email],
    );
    if (checkEmail.rows.length > 0) {
      return next(
        createHttpError(
          400,
          validationErrorMessage(["Email already registered"]),
        ),
      );
    }

    const newUserId = uuidv4();
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const skillsValue = Array.isArray(user.skills)
      ? user.skills.join(",")
      : user.skills || null;

    const result = await connectedClient.query(
      `INSERT INTO users (
        id, first_name, last_name, email, password,
        avatar, street, house_number, city, country, skills
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, email, first_name, last_name, avatar, street, house_number, city, country, skills, number_of_logins`,
      [
        newUserId,
        user.first_name,
        user.last_name,
        user.email,
        hashedPassword,
        user.avatar || null,
        user.street || null,
        user.house_number || null,
        user.city || null,
        user.country || null,
        skillsValue,
      ],
    );

    const newUser = result.rows[0];
    newUser.favorites = [];
    // Generate JWT (Access Token)
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      user: newUser,
      token,
    });
  } catch (err) {
    return next(
      createHttpError(
        500,
        "Sorry, there's an error with the DB. Unable to create user",
      ),
    );
  } finally {
    if (endConnection) await endConnection();
  }
}

// LOGIN - Authenticate user

export async function loginUser(req, res, next) {
  const { connectedClient, endConnection, error } = await connectNeonDB();

  if (error) {
    logError(`DB Connection Error: ${error}`);
    return next(createHttpError(503, "DB Connection Error"));
  }

  try {
    const { email = "", password = "" } = req.body || {};
    const errors = [];

    // Note: You may want to implement validateAllowedFields here too,
    // but the current request body is destructured directly.

    if (!email) errors.push("Email is required");
    if (!password) errors.push("Password is required");

    if (errors.length > 0) {
      // Using validationErrorMessage for 400 response
      // Connection will be closed in finally block
      return next(createHttpError(400, validationErrorMessage(errors)));
    }

    const result = await connectedClient.query(
      `${USER_FULL_INFO_QUERY} WHERE u.email = $1`,
      [email],
    );

    if (
      result.rows.length === 0 ||
      !(await bcrypt.compare(password, result.rows[0]?.password))
    ) {
      return next(createHttpError(401, "Invalid credentials"));
    }

    // Increment number of logins
    await connectedClient.query(
      "UPDATE users SET number_of_logins = number_of_logins + 1 WHERE id = $1",
      [result.rows[0].user_id],
    );

    const user = mapUserFromJoinRows(result.rows, { includeDonation: true });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    }); // Remove the hash before sending the user object in the response

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      user,
      token,
    });
  } catch (err) {
    return next(
      createHttpError(
        500,
        "Sorry, there's an error with the DB. Unable to login user",
      ),
    );
  } finally {
    // 💡 Crucial: Ensure the connection is closed regardless of success or failure.
    if (endConnection) await endConnection();
  }
}

// LOGOUT - Blacklist JWT token (In-Memory)

export async function logoutUser(req, res, next) {
  try {
    // Extract token from "Bearer <token>" header
    const token = req.cookies?.token;
    if (!token) return next(createHttpError(400, "No token provided")); // Add the token to the in-memory blacklist

    blacklistedTokens.push(token);
    res.clearCookie("token");

    res.json({ success: true, msg: "Logged out successfully" });
  } catch (err) {
    return next(createHttpError(500, "Logout error"));
  }
}

// AUTOLOGIN - Authenticate user

export async function getMe(req, res, next) {
  const { connectedClient, endConnection, error } = await connectNeonDB();
  if (error) {
    logError(`DB Connection Error: ${error}`);
    return next(createHttpError(503, "DB Connection Error"));
  }

  try {
    // User is already verified by verifyToken middleware
    const decoded = req.user;

    // Safety check: if req.user is not set, return 401
    if (!decoded || !decoded.id) {
      return next(
        createHttpError(
          401,
          "Unauthorized - Invalid or missing authentication",
        ),
      );
    }

    const result = await connectedClient.query(
      `${USER_FULL_INFO_QUERY} WHERE u.id = $1`,
      [decoded.id],
    );
    if (result.rows.length === 0) {
      return next(createHttpError(401, "User not found"));
    }

    const user = mapUserFromJoinRows(result.rows);

    res.json({ success: true, user: user });
  } catch (err) {
    return next(createHttpError(500, "Failed to fetch user data"));
  } finally {
    if (endConnection) await endConnection();
  }
}

export async function updateProfile(req, res) {
  const user_id = req.user.id;
  const fields = req.body;
  const updatedUser = await updateUserProfile(user_id, fields);
  res.json({ success: true, user: updatedUser });
}

export async function updateUserAvatar(req, res, next) {
  const { connectedClient, endConnection, error } = await connectNeonDB();

  if (error) {
    logError(`DB Connection Error: ${error}`);
    return next(createHttpError(503, "DB Connection Error"));
  }

  try {
    const file = req.file;
    const imageUrl = await uploadImage(file);
    const user_id = req.user.id;
    await connectedClient.query(
      `UPDATE users
      SET avatar = $1
      WHERE id = $2 `,
      [imageUrl, user_id],
    );

    res.send({
      success: true,
      message: "Image uploaded successfully.",
      url: imageUrl,
    });
  } catch (error) {
    return next(createHttpError(500, "Error uploading image."));
  } finally {
    if (endConnection) await endConnection();
  }
}
