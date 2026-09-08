import { Severity, FindingStatus } from "../../../shared/src/constants/enums.js";
import { maskSecret } from "../../../security/src/masker.js";
import { generateFingerprint, generateFindingId } from "../../../security/src/fingerprint.js";

/**
 * Standardized Secret Finding Model
 */
export class Finding {
  constructor({
    type,
    ruleId,
    ruleName,
    filePath,
    line,
    column = 1,
    variable = null,
    secret,
    rawMatch = "",
    confidence = 0.5,
    severity = Severity.MEDIUM,
    entropy = 0,
    contextScore = 0,
    remediation = [],
    status = FindingStatus.OPEN,
    metadata = {}
  }) {
    this.fingerprint = generateFingerprint(secret, filePath);
    this.id = generateFindingId({ filePath, line, ruleId, fingerprint: this.fingerprint });
    this.type = type;
    this.ruleId = ruleId;
    this.ruleName = ruleName;
    this.filePath = filePath;
    this.line = line;
    this.column = column;
    this.variable = variable;
    this.maskedSecret = maskSecret(secret);
    this.snippet = rawMatch.trim();
    this.confidence = Math.min(Math.max(Number(confidence.toFixed(2)), 0), 1);
    this.severity = severity;
    this.entropy = Number(entropy.toFixed(2));
    this.contextScore = Number(contextScore.toFixed(2));
    this.status = status;
    this.remediation = remediation.length > 0 ? remediation : [
      "1. Revoke the exposed credential immediately in the provider's console.",
      "2. Generate and deploy a newly rotated secret.",
      "3. Remove the secret from code and use environment variables/secret manager.",
      "4. Purge Git history if this file was committed.",
      "5. Inspect provider audit logs for unauthorized access.",
      "6. Mark finding as RESOLVED after verification."
    ];
    this.metadata = metadata;
    this.createdAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      fingerprint: this.fingerprint,
      type: this.type,
      ruleId: this.ruleId,
      ruleName: this.ruleName,
      filePath: this.filePath,
      line: this.line,
      column: this.column,
      variable: this.variable,
      maskedSecret: this.maskedSecret,
      snippet: this.snippet,
      confidence: this.confidence,
      severity: this.severity,
      entropy: this.entropy,
      contextScore: this.contextScore,
      status: this.status,
      remediation: this.remediation,
      metadata: this.metadata,
      createdAt: this.createdAt
    };
  }
}
