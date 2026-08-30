import { RULES } from "../rules/detectorRules.js";
import { DetectorType, Severity } from "../../../packages/shared/src/constants/enums.js";
import { calculateConfidence } from "../analyzers/confidenceAnalyzer.js";
import { Finding } from "../models/finding.js";

const PRIVATE_KEY_RULES = RULES.filter(r => r.type === DetectorType.PRIVATE_KEY);

/**
 * Private Key Detector.
 * Identifies PEM, RSA, DSA, EC, OPENSSH, and PGP private key headers and files.
 */
export const privateKeyDetector = {
  id: "detector-private-key",
  name: "Private Key Detector",
  type: DetectorType.PRIVATE_KEY,

  scan(file) {
    const findings = [];
    if (!file.content) return findings;

    const lines = file.lines || file.content.split(/\r?\n/);

    lines.forEach((lineText, index) => {
      const lineNumber = index + 1;

      for (const rule of PRIVATE_KEY_RULES) {
        rule.regex.lastIndex = 0;
        const match = rule.regex.exec(lineText);

        if (match) {
          const secret = match[0];

          const { confidence, entropy, contextScore } = calculateConfidence({
            secret,
            rule,
            filePath: file.path,
            lineText,
            variable: "PRIVATE_KEY"
          });

          findings.push(
            new Finding({
              type: rule.type,
              ruleId: rule.id,
              ruleName: rule.name,
              filePath: file.path,
              line: lineNumber,
              column: match.index + 1,
              variable: "PRIVATE_KEY",
              secret,
              rawMatch: lineText,
              confidence: Math.max(confidence, 0.95), // Private key headers are deterministic
              severity: Severity.CRITICAL,
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
