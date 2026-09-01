/**
 * Detects common false positives such as UUIDs, Hex colors, MD5/SHA checksums in lockfiles,
 * and common non-secret tokens.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX_COLOR_REGEX = /^#(?:[0-9a-f]{3}){1,2}$/i;
const PURE_NUMERIC_REGEX = /^\d+$/;
const REPEATING_CHAR_REGEX = /^(.)\1+$/;

/**
 * Checks if a matched value is a false positive artifact.
 * 
 * @param {string} value - Candidate secret string
 * @param {Object} context - Optional file & variable context
 * @returns {boolean} True if it's a false positive
 */
export function isFalsePositive(value, context = {}) {
  if (!value || typeof value !== "string") return true;

  const clean = value.replace(/^['"`]|['"`;,]$/g, "").trim();

  // Too short
  if (clean.length < 6) return true;

  // Single character repeated (e.g. "aaaaaaaaa")
  if (REPEATING_CHAR_REGEX.test(clean)) return true;

  // Pure digits (e.g. timestamps, port numbers, counters)
  if (PURE_NUMERIC_REGEX.test(clean)) return true;

  // Hex color codes (e.g. #FFFFFF)
  if (HEX_COLOR_REGEX.test(clean)) return true;

  // UUIDs are rarely secrets unless explicitly part of an auth token rule
  if (UUID_REGEX.test(clean) && !context.isAuthToken) return true;

  // Common boolean/null values in strings
  if (["true", "false", "null", "undefined", "nan", "none"].includes(clean.toLowerCase())) {
    return true;
  }

  // Environment variable accessors (e.g. process.env.API_KEY, os.getenv("..."), env.get("..."))
  if (
    clean.startsWith("process.env") ||
    clean.startsWith("os.environ") ||
    clean.startsWith("System.getenv") ||
    clean.startsWith("ENV[") ||
    clean.startsWith("$_ENV") ||
    clean.startsWith("env.")
  ) {
    return true;
  }

  return false;
}
