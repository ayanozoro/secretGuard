import { connectDB, disconnectDB } from "../connection.js";
import { User } from "../models/User.js";
import { Repository } from "../models/Repository.js";
import { Scan } from "../models/Scan.js";
import { Finding } from "../models/Finding.js";
import { logger } from "../../../shared/src/utils/logger.js";
import { maskSecret } from "../../../security/src/masker.js";
import { generateFingerprint } from "../../../security/src/fingerprint.js";

async function runSeed() {
  logger.banner();
  logger.info("Starting SecretGuard MongoDB database seeder...");

  await connectDB();

  // 1. Clean existing records
  await User.deleteMany({ email: { $in: ["admin@secretguard.io", "developer@secretguard.io"] } });
  logger.info("Cleared previous seed users.");

  // 2. Create Users
  const adminUser = await User.create({
    name: "Alex Vance (Security Lead)",
    email: "admin@secretguard.io",
    password: "$2a$10$abcdefghijklmnopqrstuvwxyz0123456789EXAMPLEHASH",
    role: "ADMIN",
    apiKey: "sg_live_adm_99887766554433221100"
  });

  const devUser = await User.create({
    name: "Jordan Lee (Backend Dev)",
    email: "developer@secretguard.io",
    password: "$2a$10$abcdefghijklmnopqrstuvwxyz0123456789EXAMPLEHASH",
    role: "DEVELOPER",
    apiKey: "sg_live_dev_11223344556677889900"
  });

  logger.success(`Created users: ${adminUser.email} [ADMIN], ${devUser.email} [DEV]`);

  // 3. Create Sample Repositories
  const paymentRepo = await Repository.create({
    name: "payment-service",
    url: "https://github.com/secretguard-org/payment-service",
    isPrivate: true,
    defaultBranch: "main",
    ownerId: adminUser._id,
    totalScans: 3,
    openFindingsCount: 2,
    criticalFindingsCount: 1,
    highFindingsCount: 1,
    mediumFindingsCount: 0,
    lowFindingsCount: 0,
    lastScannedAt: new Date()
  });

  const webRepo = await Repository.create({
    name: "customer-portal",
    url: "https://github.com/secretguard-org/customer-portal",
    isPrivate: false,
    defaultBranch: "main",
    ownerId: devUser._id,
    totalScans: 1,
    openFindingsCount: 1,
    criticalFindingsCount: 0,
    highFindingsCount: 0,
    mediumFindingsCount: 1,
    lowFindingsCount: 0,
    lastScannedAt: new Date()
  });

  logger.success(`Created repositories: ${paymentRepo.name}, ${webRepo.name}`);

  // 4. Create Sample Scans
  const paymentScan = await Scan.create({
    repositoryId: paymentRepo._id,
    triggeredBy: adminUser._id,
    trigger: "CLI",
    status: "COMPLETED",
    branch: "main",
    commitHash: "7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a",
    totalFilesScanned: 48,
    totalCommitsScanned: 25,
    totalFindings: 2,
    severityCounts: {
      critical: 1,
      high: 1,
      medium: 0,
      low: 0
    },
    durationMs: 340,
    startedAt: new Date(Date.now() - 360000),
    completedAt: new Date(Date.now() - 359660)
  });

  // 5. Create Sample Findings (Zero-Plaintext)
  const syntheticAwsKey = "AKIAIOSFODNN7EXAMPLE";
  const syntheticDbPass = "SuperSecretDbPassword123!";

  await Finding.create([
    {
      scanId: paymentScan._id,
      repositoryId: paymentRepo._id,
      fingerprint: generateFingerprint(syntheticAwsKey, paymentRepo.name),
      type: "AWS_CREDENTIAL",
      ruleId: "aws-access-key-id",
      ruleName: "AWS Access Key ID",
      filePath: "config/aws.env",
      line: 4,
      column: 19,
      variable: "AWS_ACCESS_KEY_ID",
      maskedSecret: maskSecret(syntheticAwsKey),
      snippet: 'AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"',
      confidence: 0.95,
      severity: "CRITICAL",
      entropy: 3.85,
      status: "OPEN",
      remediation: [
        "1. Open AWS IAM Management Console.",
        "2. Deactivate and delete the exposed Access Key ID immediately.",
        "3. Inspect CloudTrail logs for unauthorized API activity.",
        "4. Provision IAM Roles instead of hardcoded access keys."
      ],
      metadata: {
        commitHash: "7f8a9b0",
        commitAuthor: "DevOps Engineer <ops@secretguard.io>",
        isDeletedInHead: false
      }
    },
    {
      scanId: paymentScan._id,
      repositoryId: paymentRepo._id,
      fingerprint: generateFingerprint(syntheticDbPass, paymentRepo.name),
      type: "DATABASE_CREDENTIAL",
      ruleId: "database-uri-credentials",
      ruleName: "Database Connection String with Credentials",
      filePath: "src/database/client.js",
      line: 12,
      column: 1,
      variable: "DATABASE_URL",
      maskedSecret: maskSecret(syntheticDbPass),
      snippet: 'const DB_URL = "postgres://admin:SuperSecretDbPassword123!@pg.internal:5432/payments";',
      confidence: 0.90,
      severity: "HIGH",
      entropy: 4.10,
      status: "OPEN",
      remediation: [
        "1. Rotate PostgreSQL database password in cloud console.",
        "2. Update application secret manager configuration.",
        "3. Restrict DB network access to private VPC subnet."
      ],
      metadata: {
        commitHash: "3d4e5f6",
        commitAuthor: "Jordan Lee <dev@secretguard.io>",
        isDeletedInHead: true
      }
    }
  ]);

  logger.success("Created realistic seed findings with zero-plaintext security enforcement.");
  logger.success("Database seed completed successfully!");

  await disconnectDB();
}

runSeed().catch(err => {
  logger.error("Database seed failed:", err);
  process.exit(1);
});
