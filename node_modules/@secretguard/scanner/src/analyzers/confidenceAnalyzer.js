import { calculateShannonEntropy, calculateCharsetDiversity } from "./entropyAnalyzer.js";
import { analyzeContext } from "./contextAnalyzer.js";

/**
 * Calculates a normalized confidence score (0.0 to 1.0) by aggregating multiple signals:
 * 1. Base rule specificity (Known provider format vs generic assignment)
 * 2. Shannon entropy of the secret value
 * 3. Character set diversity
 * 4. Surrounding code context & file sensitivity
 * 
 * @param {Object} params
 * @param {string} params.secret - Secret value
 * @param {Object} params.rule - Detector rule definition
 * @param {string} params.filePath - File path
 * @param {string} params.lineText - Line content
 * @param {string} params.variable - Variable name
 * @returns {Object} { confidence, entropy, contextScore, signals }
 */
export function calculateConfidence({ secret, rule, filePath = "", lineText = "", variable = "" }) {
  // 1. Base rule confidence
  let baseScore = 0.50;
  if (rule.id.startsWith("aws-") || rule.id.startsWith("github-") || rule.id === "private-key-pem") {
    baseScore = 0.80; // High confidence known signature
  } else if (rule.id === "jwt-token" || rule.id.startsWith("database-")) {
    baseScore = 0.70;
  }

  // 2. Entropy Signal
  const entropy = calculateShannonEntropy(secret);
  let entropyModifier = 0.0;

  if (entropy >= 4.5) {
    entropyModifier = 0.20;
  } else if (entropy >= 3.8) {
    entropyModifier = 0.10;
  } else if (entropy < 2.5 && !rule.id.startsWith("database-")) {
    entropyModifier = -0.25; // Likely a dictionary word or low entropy string
  }

  // 3. Charset Diversity
  const diversity = calculateCharsetDiversity(secret);
  const diversityModifier = (diversity - 0.5) * 0.1;

  // 4. Context Signal
  const context = analyzeContext({ filePath, lineText, variable });
  const contextModifier = context.score * 0.25;

  // Aggregate
  let totalConfidence = baseScore + entropyModifier + diversityModifier + contextModifier;

  // Clamp strictly between 0.05 and 0.99
  const finalConfidence = Math.min(Math.max(Number(totalConfidence.toFixed(2)), 0.05), 0.99);

  return {
    confidence: finalConfidence,
    entropy,
    contextScore: context.score,
    signals: [...context.signals, `entropy_${entropy.toFixed(1)}`, `diversity_${diversity.toFixed(1)}`]
  };
}
