/**
 * Shannon Entropy Analyzer
 * 
 * Mathematical Formulation:
 * H(X) = - Σ (P(x_i) * log2(P(x_i)))
 * where P(x_i) is the probability/frequency of occurrence of character x_i in the string.
 * 
 * Higher entropy indicates greater randomness (e.g. Base64, Hex, Cryptographic keys).
 * Lower entropy indicates structured language, English words, or repeating characters.
 */

/**
 * Calculates the Shannon Entropy of a string.
 * 
 * @param {string} str - Input string
 * @returns {number} Entropy in bits per character (typically 0.0 - 6.0+)
 */
export function calculateShannonEntropy(str) {
  if (!str || typeof str !== "string" || str.length === 0) {
    return 0;
  }

  const clean = str.replace(/^['"`]|['"`;,]$/g, "");
  const len = clean.length;
  if (len === 0) return 0;

  const frequencies = {};
  for (let i = 0; i < len; i++) {
    const char = clean[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * Checks character pool diversity (lowercase, uppercase, digits, symbols).
 * 
 * @param {string} str 
 * @returns {number} Diversity ratio (0.0 to 1.0)
 */
export function calculateCharsetDiversity(str) {
  if (!str || str.length === 0) return 0;

  let hasLower = false;
  let hasUpper = false;
  let hasDigit = false;
  let hasSymbol = false;

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 97 && code <= 122) hasLower = true;
    else if (code >= 65 && code <= 90) hasUpper = true;
    else if (code >= 48 && code <= 57) hasDigit = true;
    else hasSymbol = true;
  }

  const poolCount = (hasLower ? 1 : 0) + (hasUpper ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSymbol ? 1 : 0);
  return poolCount / 4;
}
