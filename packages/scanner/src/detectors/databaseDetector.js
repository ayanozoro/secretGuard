import { RULES } from "../rules/detectorRules.js";
import { DetectorType } from "../../../packages/shared/src/constants/enums.js";
import { isPlaceholder } from "../filters/placeholderFilter.js";
import { isFalsePositive } from "../filters/falsePositiveFilter.js";
import { calculateConfidence } from "../analyzers/confidenceAnalyzer.js";
import { calculateRisk } from "../analyzers/riskAnalyzer.js";
import { Finding } from "../models/finding.js";

const DB_RULES = RULES.filter(r => r.type === DetectorType.DATABASE_CREDENTIAL);

/**
 * Database Credential Detector.
 * Identifies database URIs (PostgreSQL, MySQL, MongoDB, Redis) containing embedded passwords.
 */
export const databaseDetector = {
  id: "detector-database",
  name: "Database Credential Detector",
  type: DetectorType.DATABASE_CREDENTIAL,

  scan(file) {
    const findings = [];
    if (!file.content) return findings;

    const lines = file.lines || file.content.split(/\r?\n/);

    lines.forEach((lineText, index) => {
      const lineNumber = index + 1;

      for (const rule of DB_RULES) {
        rule.regex.lastIndex = 0;
        let match;

        while ((match = rule.regex.exec(lineText)) !== null) {
          const password = (rule.captureGroup ? match[rule.captureGroup] : match[0]).trim();
          if (!password) continue;

          if (isPlaceholder(password) || isFalsePositive(password)) {
            continue;
          }

          const { confidence, entropy, contextScore } = calculateConfidence({
            secret: password,
            rule,
            filePath: file.path,
            lineText,
            variable: "DATABASE_PASSWORD"
          });

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
              variable: "DATABASE_URI",
              secret: password,
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
