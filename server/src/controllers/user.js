import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectNeonDB from "../db/connectNeonDB.js";
import { v4 as uuidv4 } from "uuid";

import validationErrorMessage from "../util/validationErrorMessage.js";
import { logError } from "../util/logging.js";
import { blacklistedTokens } from "../middleware/authVerify.js";
import validateCreactUser from "../util/validateCreactUser.js";
import updateUserProfile from "./profile.js";
import uploadImage from "../services/ImageUpload.js";

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

if (!process.env.JWT_EXPIRES_IN) {
  throw new Error("JWT_EXPIRES_IN environment variable is not set");
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const USER_FULL_INFO_QUERY = `
  SELECT
    u.id AS user_id, u.email, u.password, u.first_name, u.last_name, u.avatar,
    u.street, u.house_number, u.city, u.country, u.skills,
    uf.travel_time, uf.least_transfers,
    j.id AS job_id, j.date_posted, j.title, j.organization, j.organization_url,
    j.employment_type, j.url, j.organization_logo, j.display_location,
    j.work_mode, j.seniority, j.description_text, j.normalized_description
  FROM users u
  LEFT JOIN user_favorites uf ON u.id = uf.user_id
  LEFT JOIN jobs j ON uf.job_id = j.id
`;

// SIGNUP - Create a new user

export async function createUser(req, res) {
  const { connectedClient, endConnection, error } = await connectNeonDB();
  if (error) {
    return res.status(503).json({
      success: false,
      msg: "Service unavailable. Could not connect to the database.",
    });
  }

  try {
    const user = req.body?.user || {};
    const { valid, errors } = validateCreactUser(user);

    if (!valid) {
      return res
        .status(400)
        .json({ success: false, msg: validationErrorMessage(errors) });
    }

    const checkEmail = await connectedClient.query(
      "SELECT id FROM users WHERE email = $1",
      [user.email],
    );
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        msg: validationErrorMessage(["Email already registered"]),
      });
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
      RETURNING id, email, first_name, last_name, avatar, street, house_number, city, country, skills`,
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
    logError(err);
    res.status(500).json({
      success: false,
      msg: "Sorry, there's an error with the DB. Unable to create user",
    });
  } finally {
    if (endConnection) await endConnection();
  }
}

// LOGIN - Authenticate user

export async function loginUser(req, res) {
  const { connectedClient, endConnection, error } = await connectNeonDB();

  if (error) {
    return res.status(503).json({
      success: false,
      msg: "Service unavailable. Could not connect to the database.",
    });
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
      return res
        .status(400)
        .json({ success: false, msg: validationErrorMessage(errors) });
    }

    const result = await connectedClient.query(
      `${USER_FULL_INFO_QUERY} WHERE u.email = $1`,
      [email],
    );

    if (
      result.rows.length === 0 ||
      !(await bcrypt.compare(password, result.rows[0]?.password))
    ) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    const rows = result.rows;
    const userDataRow = rows[0];

    const user = {
      id: userDataRow.user_id,
      email: userDataRow.email,
      first_name: userDataRow.first_name,
      last_name: userDataRow.last_name,
      avatar: userDataRow.avatar,
      // Return address fields at top-level
      street: userDataRow.street,
      house_number: userDataRow.house_number,
      city: userDataRow.city,
      country: userDataRow.country,
      skills: userDataRow.skills
        ? userDataRow.skills.split(",").map((skill) => skill.trim())
        : [],
      favorites: [],
    };

    rows.forEach((row) => {
      if (row.job_id) {
        const jobFavorite = {
          id: row.job_id,
          date_posted: row.date_posted,
          title: row.title,
          organization: row.organization,
          organization_url: row.organization_url,
          employment_type: row.employment_type,
          url: row.url,
          organization_logo: row.organization_logo,
          display_location: row.display_location,
          work_mode: row.work_mode,
          seniority: row.seniority,
          description_text: row.description_text,
          travel_time: row.travel_time,
          least_transfers: row.least_transfers,
          normalized_description: row.normalized_description,
        };
        user.favorites.push(jobFavorite);
      }
    });

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
    // Using logError for 500 response
    logError(err);
    res.status(500).json({
      success: false,
      msg: "Sorry, there's an error with the DB. Unable to login user",
    });
  } finally {
    // 💡 Crucial: Ensure the connection is closed regardless of success or failure.
    if (endConnection) await endConnection();
  }
}

// LOGOUT - Blacklist JWT token (In-Memory)

export async function logoutUser(req, res) {
  try {
    // Extract token from "Bearer <token>" header
    const token = req.cookies?.token;
    if (!token)
      return res.status(400).json({ success: false, msg: "No token provided" }); // Add the token to the in-memory blacklist

    blacklistedTokens.push(token);
    res.clearCookie("token");

    res.json({ success: true, msg: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Logout error" });
  }
}

export async function getMe(req, res) {
  const { connectedClient, endConnection, error } = await connectNeonDB();
  if (error) {
    return res.status(503).json({
      success: false,
      msg: "Service unavailable. Could not connect to the database.",
    });
  }

  try {
    // User is already verified by verifyToken middleware
    const decoded = req.user;

    // Safety check: if req.user is not set, return 401
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        msg: "Unauthorized - Invalid or missing authentication",
      });
    }

    const result = await connectedClient.query(
      `${USER_FULL_INFO_QUERY} WHERE u.id = $1`,
      [decoded.id],
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, msg: "User not found" });
    }
    const rows = result.rows;
    const userDataRow = rows[0];

    const user = {
      id: userDataRow.user_id,
      email: userDataRow.email,
      first_name: userDataRow.first_name,
      last_name: userDataRow.last_name,
      avatar: userDataRow.avatar,
      street: userDataRow.street,
      house_number: userDataRow.house_number,
      city: userDataRow.city,
      country: userDataRow.country,
      skills: userDataRow.skills
        ? userDataRow.skills.split(",").map((skill) => skill.trim())
        : [],
      favorites: [],
    };
    rows.forEach((row) => {
      if (row.job_id) {
        const jobFavorite = {
          id: row.job_id,
          date_posted: row.date_posted,
          title: row.title,
          organization: row.organization,
          organization_url: row.organization_url,
          employment_type: row.employment_type,
          url: row.url,
          organization_logo: row.organization_logo,
          display_location: row.display_location,
          work_mode: row.work_mode,
          seniority: row.seniority,
          description_text: row.description_text,
          travel_time: row.travel_time,
          least_transfers: row.least_transfers,
          normalized_description: row.normalized_description,
        };
        user.favorites.push(jobFavorite);
      }
    });

    res.json({ success: true, user: user });
  } catch (err) {
    logError(`Error in getMe: ${err}`);
    return res
      .status(500)
      .json({ success: false, msg: "Failed to fetch user data" });
  } finally {
    if (endConnection) await endConnection();
  }
}

export async function updateProfile(req, res) {
  const user_id = req.user.id;
  const fields = req.body;

  try {
    const updatedUser = await updateUserProfile(user_id, fields);
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err instanceof Error ? err.message : "Update error",
    });
  }
}

export async function updateUserAvatar(req, res) {
  const { connectedClient, endConnection } = await connectNeonDB();
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
    logError(error);
    res.status(500).json({
      success: false,
      message: "Error uploading image.",
    });
  } finally {
    if (endConnection) await endConnection();
  }
}
