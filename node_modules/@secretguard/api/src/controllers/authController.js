import * as authService from "../services/authService.js";

/**
 * Handles user registration.
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.registerUser({ name, email, password, role });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles user login and JWT issuance.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves the currently authenticated user's profile.
 */
export async function getMe(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generates and rotates an API key for the authenticated user.
 */
export async function rotateApiKey(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const result = await authService.rotateApiKey(userId);
    res.status(200).json({
      success: true,
      message: "API key rotated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export default {
  register,
  login,
  getMe,
  rotateApiKey
};
