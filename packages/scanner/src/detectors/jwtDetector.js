import { RULES } from "../rules/detectorRules.js";
import { DetectorType } from "../../../packages/shared/src/constants/enums.js";
import { isPlaceholder } from "../filters/placeholderFilter.js";
import { isFalsePositive } from "../filters/falsePositiveFilter.js";
import { calculateConfidence } from "../analyzers/confidenceAnalyzer.js";
import { calculateRisk } from "../analyzers/riskAnalyzer.js";
import { Finding } from "../models/finding.js";

const JWT_RULES = RULES.filter(r => r.type === DetectorType.JWT_SECRET);

/**
 * Validates whether the first segment of a JWT can be decoded as a valid JSON header with "alg" or "typ".
 */
function isValidJwtHeader(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const headerStr = Buffer.from(parts[0], "base64url").toString("utf8");
    const header = JSON.parse(headerStr);
    return Boolean(header && (header.alg || header.typ));
  } catch {
    return false;
  }
}

/**
 * JSON Web Token (JWT) Detector.
 */
export const jwtDetector = {
  id: "detector-jwt",
  name: "JWT Detector",
  type: DetectorType.JWT_SECRET,

  scan(file) {
    const findings = [];
    if (!file.content) return findings;

    const lines = file.lines || file.content.split(/\r?\n/);

    lines.forEach((lineText, index) => {
      const lineNumber = index + 1;

      for (const rule of JWT_RULES) {
        rule.regex.lastIndex = 0;
        let match;

        while ((match = rule.regex.exec(lineText)) !== null) {
          const secret = (rule.captureGroup ? match[rule.captureGroup] : match[0]).trim();
          if (!secret) continue;

          if (isPlaceholder(secret) || isFalsePositive(secret)) {
            continue;
          }

          // Structural header check
          if (!isValidJwtHeader(secret)) {
            continue;
          }

          const varMatch = lineText.match(/([a-zA-Z0-9_\-\.]+)\s*[:=]/);
          const variable = varMatch ? varMatch[1] : "JWT_TOKEN";

          const { confidence, entropy, contextScore } = calculateConfidence({
            secret,
            rule,
            filePath: file.path,
            lineText,
            variable
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
