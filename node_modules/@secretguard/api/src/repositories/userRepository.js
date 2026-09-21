import { User } from "@secretguard/database";

/**
 * Finds a user by their lowercase email address.
 * 
 * @param {string} email 
 * @returns {Promise<Object|null>}
 */
export async function findByEmail(email) {
  if (!email) return null;
  return await User.findOne({ email: email.toLowerCase().trim() });
}

/**
 * Finds a user by their MongoDB ObjectId.
 * 
 * @param {string|mongoose.Types.ObjectId} id 
 * @returns {Promise<Object|null>}
 */
export async function findById(id) {
  if (!id) return null;
  return await User.findById(id);
}

/**
 * Finds an active user by their API key.
 * 
 * @param {string} apiKey 
 * @returns {Promise<Object|null>}
 */
export async function findByApiKey(apiKey) {
  if (!apiKey) return null;
  return await User.findOne({ apiKey: apiKey.trim(), isActive: true });
}

/**
 * Creates and persists a new user record.
 * 
 * @param {Object} userData 
 * @returns {Promise<Object>}
 */
export async function create(userData) {
  return await User.create(userData);
}

/**
 * Updates a user record by ID.
 * 
 * @param {string|mongoose.Types.ObjectId} userId 
 * @param {Object} updateData 
 * @returns {Promise<Object|null>}
 */
export async function update(userId, updateData) {
  return await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
}

/**
 * Deletes a user record by ID.
 * 
 * @param {string|mongoose.Types.ObjectId} userId 
 * @returns {Promise<Object|null>}
 */
export async function deleteById(userId) {
  return await User.findByIdAndDelete(userId);
}

export default {
  findByEmail,
  findById,
  findByApiKey,
  create,
  update,
  deleteById
};