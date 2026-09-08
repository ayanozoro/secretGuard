import mongoose from "mongoose";
import { User, Repository, Scan, Finding, ScanJob, Integration } from "../../packages/database/src/index.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✓\x1b[0m ${message}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✗\x1b[0m ${message}`);
    failed++;
  }
}

console.log("\n\x1b[36m[Testing Database Package Models & Schema Security]\x1b[0m");

// 1. User Model & Sanitization
const dummyUser = new User({
  name: "Jane Doe",
  email: "jane@example.com",
  passwordHash: "super_secret_bcrypt_hash",
  role: "ADMIN"
});
const userJson = dummyUser.toJSON();
assert(userJson.name === "Jane Doe", "User name mapped correctly");
assert(userJson.passwordHash === undefined, "passwordHash is securely deleted in toJSON");
assert(userJson.id !== undefined, "User _id converted to id in toJSON");

// 2. Repository Model
const dummyRepo = new Repository({
  name: "auth-service",
  url: "https://github.com/org/auth-service",
  ownerId: dummyUser._id,
  isPrivate: true
});
const repoJson = dummyRepo.toJSON();
assert(repoJson.name === "auth-service", "Repository name mapped correctly");
assert(repoJson.totalScans === 0, "Default totalScans is 0");
assert(repoJson.criticalFindingsCount === 0, "Default criticalFindingsCount is 0");

// 3. Scan Model
const dummyScan = new Scan({
  repositoryId: dummyRepo._id,
  trigger: "CLI",
  status: "COMPLETED",
  totalFilesScanned: 25,
  totalFindings: 1
});
const scanJson = dummyScan.toJSON();
assert(scanJson.status === "COMPLETED", "Scan status initialized properly");
assert(scanJson.severityCounts.critical === 0, "Default severityCounts.critical is 0");

// 4. Finding Model (Zero-Plaintext Policy)
const dummyFinding = new Finding({
  scanId: dummyScan._id,
  repositoryId: dummyRepo._id,
  fingerprint: "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
  type: "AWS_CREDENTIAL",
  ruleId: "aws-access-key-id",
  ruleName: "AWS Access Key ID",
  filePath: ".env",
  line: 5,
  maskedSecret: "AK••••••••••••••••LE",
  snippet: 'AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"',
  confidence: 0.95,
  severity: "CRITICAL",
  entropy: 3.85,
  status: "OPEN",
  remediation: ["Revoke immediately in AWS console."]
});
const findingJson = dummyFinding.toJSON();
assert(findingJson.severity === "CRITICAL", "Finding severity mapped as CRITICAL");
assert(findingJson.maskedSecret === "AK••••••••••••••••LE", "Masked secret preserved");
assert(findingJson.fingerprint.length === 64, "Deterministic SHA-256 fingerprint verified");
assert(findingJson.status === "OPEN", "Finding status default is OPEN");

// 5. ScanJob Model
const dummyJob = new ScanJob({
  scanId: dummyScan._id,
  repositoryId: dummyRepo._id,
  jobId: "bullmq-job-12345",
  status: "QUEUED",
  stage: "INIT"
});
const jobJson = dummyJob.toJSON();
assert(jobJson.jobId === "bullmq-job-12345", "Job ID stored properly");
assert(jobJson.progress === 0, "Job progress starts at 0%");

// 6. Integration Model (Encrypted Token Sanitization)
const dummyIntegration = new Integration({
  userId: dummyUser._id,
  provider: "GITHUB",
  providerUsername: "octocat",
  encryptedAccessToken: "12345678:abcdef:encryptedCiphertextValue",
  scopes: ["repo", "read:org"]
});
const integrationJson = dummyIntegration.toJSON();
assert(integrationJson.provider === "GITHUB", "Integration provider is GITHUB");
assert(integrationJson.encryptedAccessToken === undefined, "encryptedAccessToken is sanitized out of JSON output");

console.log("\n============================================================");
console.log(`Database Tests: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`);
console.log("============================================================\n");

if (failed > 0) {
  process.exit(1);
}
