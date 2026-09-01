import { RULES } from "../rules/detectorRules.js";
import { DetectorType } from "../../../shared/src/constants/enums.js";
import { isPlaceholder } from "../filters/placeholderFilter.js";
import { isFalsePositive } from "../filters/falsePositiveFilter.js";
import { calculateConfidence } from "../analyzers/confidenceAnalyzer.js";
import { calculateRisk } from "../analyzers/riskAnalyzer.js";
import { Finding } from "../models/finding.js";

const GITHUB_RULES = RULES.filter(r => r.type === DetectorType.GITHUB_TOKEN);

/**
 * GitHub Token Detector.
 * Identifies Classic PATs (ghp_), Fine-Grained PATs (github_pat_), and OAuth tokens (gho_).
 */
export const githubDetector = {
  id: "detector-github",
  name: "GitHub Token Detector",
  type: DetectorType.GITHUB_TOKEN,

  scan(file) {
    const findings = [];
    if (!file.content) return findings;

    const lines = file.lines || file.content.split(/\r?\n/);

    lines.forEach((lineText, index) => {
      const lineNumber = index + 1;

      for (const rule of GITHUB_RULES) {
        rule.regex.lastIndex = 0;
        let match;

        while ((match = rule.regex.exec(lineText)) !== null) {
          const secret = (rule.captureGroup ? match[rule.captureGroup] : match[0]).trim();
          if (!secret) continue;

          if (isPlaceholder(secret) || isFalsePositive(secret)) {
            continue;
          }

          const varMatch = lineText.match(/([a-zA-Z0-9_\-\.]+)\s*[:=]/);
          const variable = varMatch ? varMatch[1] : "GITHUB_TOKEN";

          const { confidence, entropy, contextScore } = calculateConfidence({
            secret,
            rule,
            filePath: file.path,
            lineText,
            variable
          });

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
