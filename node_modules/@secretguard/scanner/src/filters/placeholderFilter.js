/**
 * List of known placeholder patterns, dummy values, and template variables.
 */
const EXACT_PLACEHOLDERS = new Set([
  "YOUR_API_KEY",
  "YOUR_API_SECRET",
  "YOUR_SECRET",
  "YOUR_PASSWORD",
  "YOUR_TOKEN",
  "YOUR_ACCESS_KEY",
  "YOUR_SECRET_KEY",
  "YOUR_CLIENT_ID",
  "YOUR_CLIENT_SECRET",
  "CHANGE_ME",
  "CHANGE-THIS",
  "CHANGEME",
  "REPLACE_ME",
  "REPLACE_WITH_YOUR_KEY",
  "REPLACE_THIS",
  "EXAMPLE",
  "EXAMPLE_KEY",
  "EXAMPLE_TOKEN",
  "EXAMPLE_SECRET",
  "DUMMY",
  "DUMMY_KEY",
  "DUMMY_SECRET",
  "PLACEHOLDER",
  "TEST",
  "TESTING",
  "TEST_KEY",
  "TEST_SECRET",
  "TEST_TOKEN",
  "DEFAULT",
  "DEFAULT_KEY",
  "DEFAULT_SECRET",
  "FOOBAR",
  "FOOBARBAZ",
  "SECRET_HERE",
  "KEY_HERE",
  "PASSWORD_HERE",
  "INSERT_KEY_HERE",
  "MY_SECRET_KEY",
  "MY_API_KEY"
]);

const PLACEHOLDER_PATTERNS = [
  /^x{6,}$/i, // "xxxxxx"
  /^0{6,}$/,   // "000000"
  /^1{6,}$/,   // "111111"
  /^(?:123456|abcdef|secret|password|admin)$/i,
  /^your[-_]?.*[-_]?key$/i,
  /^replace[-_]?.*$/i,
  /^change[-_]?.*$/i,
  /^example[-_]?.*$/i,
  /^dummy[-_]?.*$/i,
  /^test[-_]?.*$/i,
  /^<.*>$/,       // "<API_KEY>"
  /^{{.*}}$/,     // "{{API_KEY}}"
  /^\$\{.*\}$/,   // "${API_KEY}"
  /^%.*%$/        // "%API_KEY%"
];

/**
 * Checks if a matched string is an obvious placeholder or template variable.
 * 
 * @param {string} value - Potential secret string
 * @returns {boolean} True if string is a placeholder
 */
export function isPlaceholder(value) {
  if (!value || typeof value !== "string") return true;

  const clean = value.replace(/^['"`]|['"`;,]$/g, "").trim();
  if (clean.length < 4) return true;

  const upper = clean.toUpperCase();

  if (EXACT_PLACEHOLDERS.has(upper)) {
    return true;
  }

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(clean)) {
      return true;
    }
  }

  return false;
}
