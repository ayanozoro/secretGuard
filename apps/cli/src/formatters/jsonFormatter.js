/**
 * Formats scan results into structured, machine-readable JSON for CI/CD integrations.
 * 
 * @param {Object} scanResult 
 * @returns {string} Formatted JSON string
 */
export function formatJsonReport(scanResult) {
  const output = {
    schemaVersion: "1.0.0",
    scanner: "SecretGuard",
    timestamp: new Date().toISOString(),
    summary: {
      target: scanResult.target,
      isGit: scanResult.isGit || false,
      includeHistory: scanResult.includeHistory || false,
      totalFilesScanned: scanResult.totalFilesScanned,
      totalCommitsScanned: scanResult.totalCommitsScanned || 0,
      totalFindings: scanResult.totalFindings,
      durationMs: scanResult.durationMs,
      severityCounts: scanResult.severityCounts
    },
    findings: scanResult.findings.map(f => ({
      id: f.id,
      fingerprint: f.fingerprint,
      type: f.type,
      ruleId: f.ruleId,
      ruleName: f.ruleName,
      filePath: f.filePath,
      line: f.line,
      column: f.column,
      variable: f.variable,
      maskedSecret: f.maskedSecret,
      snippet: f.snippet,
      confidence: f.confidence,
      severity: f.severity,
      entropy: f.entropy,
      contextScore: f.contextScore,
      status: f.status,
      remediation: f.remediation,
      metadata: f.metadata
    }))
  };

  return JSON.stringify(output, null, 2);
}
