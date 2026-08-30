import { RULES } from "../rules/detectorRules.js";
import { DetectorType } from "../../../packages/shared/src/constants/enums.js";
import { isPlaceholder } from "../filters/placeholderFilter.js";
import { isFalsePositive } from "../filters/falsePositiveFilter.js";
import { calculateConfidence } from "../analyzers/confidenceAnalyzer.js";
import { calculateRisk } from "../analyzers/riskAnalyzer.js";
import { Finding } from "../models/finding.js";

const GENERIC_RULES = RULES.filter(r => r.type === DetectorType.GENERIC_SECRET);

/**
 * Generic Secret Detector.
 * Identifies suspicious credential assignments, password declarations, and bearer tokens.
 */
export const genericDetector = {
  id: "detector-generic",
  name: "Generic Secret Detector",
  type: DetectorType.GENERIC_SECRET,

  /**
   * Scans file lines for generic secrets.
   * 
   * @param {Object} file - { path, content, lines }
   * @returns {Array<Finding>}
   */
  scan(file) {
    const findings = [];
    if (!file.content) return findings;

    const lines = file.lines || file.content.split(/\r?\n/);

    lines.forEach((lineText, index) => {
      const lineNumber = index + 1;

      for (const rule of GENERIC_RULES) {
        // Reset regex state
        rule.regex.lastIndex = 0;
        let match;

        while ((match = rule.regex.exec(lineText)) !== null) {
          const secret = (rule.captureGroup ? match[rule.captureGroup] : match[0]).trim();
          if (!secret) continue;

          // Placeholder & False Positive Checks
          if (isPlaceholder(secret) || isFalsePositive(secret)) {
            continue;
          }

          // Extract candidate variable name from match if possible
          const varMatch = lineText.match(/([a-zA-Z0-9_\-\.]+)\s*[:=]/);
          const variable = varMatch ? varMatch[1] : null;

          // Scoring
          const { confidence, entropy, contextScore } = calculateConfidence({
            secret,
            rule,
            filePath: file.path,
            lineText,
            variable
          });

          // Check minimum entropy if rule defines it
          if (rule.minEntropy && entropy < rule.minEntropy) {
            continue;
          }

          const severity = calculateRisk({
            type: rule.type,
            confidence,
            ruleSeverity: rule.severity,
            isTestFile: file.path.includes("test")
          });

          findings.push(
            new Finding({
              type: rule.type,
              ruleId: rule.id,
              ruleName: rule.name,
              filePath: file.path,
              line: lineNumber,
              column: match.index + 1,
              variable,
              secret,
              rawMatch: lineText,
              confidence,
              severity,
              entropy,
              contextScore,
              remediation: rule.remediation
            })
          );
        }
      }
    });

    return findings;
  }
};
