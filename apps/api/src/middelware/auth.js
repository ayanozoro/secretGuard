import jwt from "jsonwebtoken";
import * as userRepo from "../repositories/userRepository.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretguard-jwt-super-secret-key-32b!";

/**
 * Authentication middleware that verifies either a Bearer JWT or an x-api-key header.
 * Attaches the authenticated user document to req.user.
 */
export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers["x-api-key"];

    if (!authHeader && !apiKeyHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Provide a Bearer token or x-api-key header."
      });
    }

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await userRepo.findById(decoded.id);
    } else if (apiKeyHeader) {
      req.user = await userRepo.findByApiKey(apiKeyHeader);
    }

    if (!req.user || req.user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or revoked credentials"
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: " + (error.message || "Invalid authentication token")
    });
  }
}

/**
 * Role-based authorization middleware.
 * 
 * @param {Array<string>} roles - Allowed roles (e.g. ['ADMIN', 'SECURITY_ENGINEER'])
 */
export function roleBasedAuth(roles = []) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${roles.join(", ")}] roles. Current role: ${req.user.role}`
      });
    }

    next();
  };
}

export default {
  protect,
  roleBasedAuth
};