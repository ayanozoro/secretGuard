/**
 * Severity levels for detected security findings.
 */
export const Severity = Object.freeze({
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  INFO: "INFO"
});

/**
 * Finding lifecycle status.
 */
export const FindingStatus = Object.freeze({
  OPEN: "OPEN",
  RESOLVED: "RESOLVED",
  IGNORED: "IGNORED",
  REVOKED: "REVOKED",
  FALSE_POSITIVE: "FALSE_POSITIVE"
});

/**
 * Detector categories.
 */
export const DetectorType = Object.freeze({
  GENERIC_SECRET: "GENERIC_SECRET",
  AWS_CREDENTIAL: "AWS_CREDENTIAL",
  GITHUB_TOKEN: "GITHUB_TOKEN",
  JWT_SECRET: "JWT_SECRET",
  PRIVATE_KEY: "PRIVATE_KEY",
  DATABASE_CREDENTIAL: "DATABASE_CREDENTIAL"
});

/**
 * Scan job trigger sources.
 */
export const ScanTrigger = Object.freeze({
  CLI: "CLI",
  MANUAL: "MANUAL",
  SCHEDULED: "SCHEDULED",
  WEBHOOK_PUSH: "WEBHOOK_PUSH",
  WEBHOOK_PR: "WEBHOOK_PR"
});

/**
 * Scan lifecycle status.
 */
export const ScanStatus = Object.freeze({
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED"
});
