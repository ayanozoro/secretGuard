import { Severity, DetectorType } from "../../../packages/shared/src/constants/enums.js";

/**
 * Evaluates the risk level based on credential type, confidence score, and file context.
 * 
 * @param {Object} params
 * @param {string} params.type - DetectorType
 * @param {number} params.confidence - 0.0 to 1.0
 * @param {string} params.ruleSeverity - Base rule severity
 * @param {boolean} params.isTestFile - Whether finding is in a test file
 * @returns {string} Evaluated Severity enum value
 */
export function calculateRisk({ type, confidence, ruleSeverity, isTestFile = false }) {
  // If it's a test fixture/test file, downgrade severity by one level unless it's a private key
  if (isTestFile && type !== DetectorType.PRIVATE_KEY) {
    if (ruleSeverity === Severity.CRITICAL) return Severity.HIGH;
    if (ruleSeverity === Severity.HIGH) return Severity.MEDIUM;
    return Severity.LOW;
  }

  // Low confidence findings get capped to LOW/MEDIUM to avoid alarming alerts
  if (confidence < 0.40) {
    return Severity.LOW;
  }
  if (confidence < 0.65 && ruleSeverity === Severity.CRITICAL) {
    return Severity.HIGH;
  }

  // Types that are always CRITICAL if confidence is solid
  if (type === DetectorType.PRIVATE_KEY || (type === DetectorType.AWS_CREDENTIAL && confidence >= 0.70)) {
    return Severity.CRITICAL;
  }

  return ruleSeverity || Severity.MEDIUM;
}
