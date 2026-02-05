import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

const JWT_SECRET = process.env.JWT_SECRET;
export const blacklistedTokens = [];

// ========================
// VERIFY TOKEN - Middleware
// ========================
export function verifyToken(req, res, next) {
  let msg;
  try {
    const token = req.cookies?.token;

    if (!token) {
      msg = "No token provided";
    } else {
      // Verify the token's signature and expiration time
      const decoded = jwt.verify(token, JWT_SECRET);

      if (blacklistedTokens.includes(token)) {
        msg = "Token expired or logged out";
      } else {
        // Token is valid, continue to the next middleware/handler
        req.user = decoded;
        return next();
      }
    }
  } catch (err) {
    msg = "Invalid or expired token";
  }

  const route = req.originalUrl;
  if (route.startsWith("/api/jobs/search")) {
    // Job search is accessible to both authenticated and unauthenticated users.
    // Set req.user to null for unauthenticated requests so downstream code
    // can explicitly handle guest access.
    req.user = null;
    return next();
  } else {
    return res.status(401).json({ success: false, msg });
  }
}
