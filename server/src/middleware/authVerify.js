import jwt from "jsonwebtoken";
import { createHttpError } from "./errorHandler.js";

const JWT_SECRET = process.env.JWT_SECRET;

/** token -> blacklistUntilMs (drops automatically once past JWT exp) */
const tokenBlacklist = new Map();
const BLACKLIST_SWEEP_INTERVAL_MS = 60 * 60 * 1000;

function pruneExpiredBlacklistedTokens(now = Date.now()) {
  for (const [token, until] of tokenBlacklist) {
    if (now >= until) tokenBlacklist.delete(token);
  }
}

const blacklistSweep = setInterval(
  pruneExpiredBlacklistedTokens,
  BLACKLIST_SWEEP_INTERVAL_MS,
);
blacklistSweep.unref?.();

export function addTokenToBlacklist(token) {
  const payload = jwt.decode(token);
  const now = Date.now();
  const until =
    typeof payload?.exp === "number"
      ? payload.exp * 1000
      : now + 7 * 24 * 60 * 60 * 1000;
  if (until <= now) return;
  tokenBlacklist.set(token, until);
}

function isTokenBlacklisted(token) {
  const until = tokenBlacklist.get(token);
  if (until === undefined) return false;
  if (Date.now() >= until) {
    tokenBlacklist.delete(token);
    return false;
  }
  return true;
}

/** Returns the decoded payload or null. Does not throw. */
function decodeAndValidateToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (isTokenBlacklisted(token)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function verifyToken(req, res, next) {
  const token = req.cookies?.token;
  const decoded = decodeAndValidateToken(token);
  if (!decoded) {
    return next(
      createHttpError(
        401,
        token ? "Invalid or expired token" : "No token provided",
      ),
    );
  }
  req.user = decoded;
  next();
}

export function attachUserFromCookie(req, res, next) {
  req.user = decodeAndValidateToken(req.cookies?.token);
  next();
}
