import crypto from "crypto";

/**
 * Generates a deterministic SHA-256 fingerprint for secret deduplication and database tracking.
 * This allows identifying when the exact same secret appears across commits or files without storing it in plaintext.
 * 
 * @param {string} secret - Raw secret
 * @param {string} salt - Optional salt or context (e.g. repoId)
 * @returns {string} SHA-256 Hex Digest (64 characters)
 */
export function generateFingerprint(secret, salt = "") {
  if (!secret) return "";
  const normalized = secret.trim();
  return crypto
    .createHash("sha256")
    .update(`${salt}:${normalized}`)
    .digest("hex");
}

/**
 * Generates a unique finding identity hash based on file location, rule ID, and secret fingerprint.
 * 
 * @param {Object} params
 * @param {string} params.filePath - Normalized relative path of the file
 * @param {number} params.line - Line number
 * @param {string} params.ruleId - Rule identifier
 * @param {string} params.fingerprint - Secret fingerprint
 * @returns {string} Finding UUID-like hash
 */
export function generateFindingId({ filePath, line, ruleId, fingerprint }) {
  const payload = `${filePath || ""}:${line || 0}:${ruleId || ""}:${fingerprint || ""}`;
  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 32);
}
