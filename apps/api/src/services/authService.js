import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import * as userRepository from "../repositories/userRepository.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretguard-jwt-super-secret-key-32b!";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Generates an opaque, high-entropy SecretGuard API key.
 * Format: sg_live_<48 hex chars>
 * 
 * @returns {string} API key string
 */
export function generateApiKeyToken() {
  return "sg_live_" + crypto.randomBytes(24).toString("hex");
}

/**
 * Generates a signed JWT bearer token containing user identity and role claims.
 * 
 * @param {Object} user 
 * @returns {string} Signed JWT
 */
export function generateToken(user) {
  const userId = user._id ? user._id.toString() : user.id;
  return jwt.sign(
    {
      id: userId,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verifies a signed JWT and returns the decoded payload.
 * 
 * @param {string} token 
 * @returns {Object} Decoded payload
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Registers a new user account with hashed credentials and an initial API key.
 * 
 * @param {Object} registrationData
 * @param {string} registrationData.name
 * @param {string} registrationData.email
 * @param {string} registrationData.password
 * @param {string} [registrationData.role="DEVELOPER"]
 * @returns {Promise<{ user: Object, token: string, apiKey: string }>}
 */
export async function registerUser({ name, email, password, role = "DEVELOPER" }) {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);
  const apiKey = generateApiKeyToken();

  const user = await userRepository.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role,
    apiKey,
    isActive: true
  });

  const token = generateToken(user);

  return {
    user: user.toJSON ? user.toJSON() : user,
    token,
    apiKey
  };
}

/**
 * Authenticates a user with email and password, issuing a session JWT.
 * 
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<{ user: Object, token: string }>}
 */
export async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.isActive === false) {
    const error = new Error("Account has been deactivated. Please contact an administrator.");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: user.toJSON ? user.toJSON() : user,
    token
  };
}

/**
 * Rotates an existing API key for the user.
 * 
 * @param {string|mongoose.Types.ObjectId} userId 
 * @returns {Promise<{ apiKey: string }>}
 */
export async function rotateApiKey(userId) {
  const newApiKey = generateApiKeyToken();
  const updatedUser = await userRepository.update(userId, { apiKey: newApiKey });

  if (!updatedUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return { apiKey: newApiKey };
}

export default {
  generateApiKeyToken,
  generateToken,
  verifyToken,
  registerUser,
  loginUser,
  rotateApiKey
};
