/**
 * Masks a secret string for safe display in logs, UI, CLI, and APIs.
 * Ensures the actual secret is never exposed in plaintext.
 * 
 * Example:
 *   "FAKE_SECRET_VALUE_123456" -> "FA••••••••56"
 *   "short" -> "••••••"
 *
 * @param {string} secret - Plaintext secret
 * @param {number} prefixLen - Number of leading characters to keep visible (default 2)
 * @param {number} suffixLen - Number of trailing characters to keep visible (default 2)
 * @returns {string} Masked string
 */
export function maskSecret(secret, prefixLen = 2, suffixLen = 2) {
  if (!secret || typeof secret !== "string") {
    return "••••••••";
  }

  const trimmed = secret.trim();
  const len = trimmed.length;

  if (len <= (prefixLen + suffixLen + 2)) {
    return "•".repeat(Math.max(len, 6));
  }

  const prefix = trimmed.slice(0, prefixLen);
  const suffix = trimmed.slice(-suffixLen);
  const maskCount = Math.min(Math.max(len - (prefixLen + suffixLen), 6), 16);

  return `${prefix}${"•".repeat(maskCount)}${suffix}`;
}

/**
 * Sanitizes an entire log or text line by replacing matched secrets with masked versions.
 * 
 * @param {string} line - Text containing raw secret
 * @param {string} rawSecret - Secret to mask inside the line
 * @returns {string} Sanitized line
 */
export function sanitizeLine(line, rawSecret) {
  if (!line || !rawSecret) return line || "";
  const masked = maskSecret(rawSecret);
  return line.split(rawSecret).join(masked);
}
