import { calculateShannonEntropy } from "../../packages/scanner/src/analyzers/entropyAnalyzer.js";
import { isPlaceholder } from "../../packages/scanner/src/filters/placeholderFilter.js";
import { isFalsePositive } from "../../packages/scanner/src/filters/falsePositiveFilter.js";
import { maskSecret } from "../../packages/security/src/masker.js";
import { generateFingerprint } from "../../packages/security/src/fingerprint.js";
import { awsDetector } from "../../packages/scanner/src/detectors/awsDetector.js";
import { githubDetector } from "../../packages/scanner/src/detectors/githubDetector.js";
import { jwtDetector } from "../../packages/scanner/src/detectors/jwtDetector.js";
import { privateKeyDetector } from "../../packages/scanner/src/detectors/privateKeyDetector.js";
import { databaseDetector } from "../../packages/scanner/src/detectors/databaseDetector.js";
import { genericDetector } from "../../packages/scanner/src/detectors/genericDetector.js";
import { SYNTHETIC_FIXTURES } from "../fixtures/synthetic_secrets.js";

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

console.log("\n============================================================");
console.log("             SecretGuard Phase 1 Test Suite                 ");
console.log("============================================================\n");

// 1. Shannon Entropy Tests
console.log("\x1b[36m[Testing Entropy Analyzer]\x1b[0m");
const lowEntropy = calculateShannonEntropy("aaaaaaaaaa");
const midEntropy = calculateShannonEntropy("hello_world_test");
const highEntropy = calculateShannonEntropy("wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY");
assert(lowEntropy === 0, `Low entropy repeating string calculated as 0 (got: ${lowEntropy.toFixed(2)})`);
assert(midEntropy > 2.0 && midEntropy < 3.8, `Natural word entropy is moderate (got: ${midEntropy.toFixed(2)})`);
assert(highEntropy >= 4.0, `Base64 random secret entropy is high (got: ${highEntropy.toFixed(2)})`);

// 2. Secret Masker & Fingerprint Tests
console.log("\n\x1b[36m[Testing Security Masker & Fingerprinting]\x1b[0m");
const masked = maskSecret("AKIAIOSFODNN7EXAMPLE");
assert(masked.startsWith("AK") && masked.endsWith("LE") && masked.includes("•"), `Secret properly masked: ${masked}`);
assert(!masked.includes("IOSFODNN7"), "Raw secret contents are concealed");
const fp1 = generateFingerprint("AKIAIOSFODNN7EXAMPLE", "repo1");
const fp2 = generateFingerprint("AKIAIOSFODNN7EXAMPLE", "repo1");
const fp3 = generateFingerprint("different_key", "repo1");
assert(fp1 === fp2, "Fingerprint is deterministic for identical secrets");
assert(fp1 !== fp3, "Fingerprints differ for distinct secrets");

// 3. Placeholder & False Positive Filters
console.log("\n\x1b[36m[Testing Filters]\x1b[0m");
assert(isPlaceholder("YOUR_API_KEY") === true, "Filters out YOUR_API_KEY");
assert(isPlaceholder("CHANGE_ME") === true, "Filters out CHANGE_ME");
assert(isPlaceholder("secret_live_9876543210_abcdef123456") === false, "Does not reject real synthetic secrets");
assert(isFalsePositive("#FFFFFF") === true, "Filters out Hex color codes");
assert(isFalsePositive("123456789") === true, "Filters out pure numbers");

// 4. AWS Detector Tests
console.log("\n\x1b[36m[Testing AWS Detector]\x1b[0m");
const awsFindings = awsDetector.scan({ path: "config.js", content: SYNTHETIC_FIXTURES.aws.valid });
assert(awsFindings.length >= 1, `Detected AWS credential (found: ${awsFindings.length})`);
assert(awsFindings[0].severity === "CRITICAL", `AWS credential severity is CRITICAL`);
const awsPlaceholderFindings = awsDetector.scan({ path: "config.js", content: SYNTHETIC_FIXTURES.aws.placeholder });
assert(awsPlaceholderFindings.length === 0, "Rejected AWS placeholder");

// 5. GitHub Detector Tests
console.log("\n\x1b[36m[Testing GitHub Detector]\x1b[0m");
const ghClassicFindings = githubDetector.scan({ path: "auth.js", content: SYNTHETIC_FIXTURES.github.classic });
assert(ghClassicFindings.length === 1, "Detected classic GitHub PAT (ghp_)");
const ghFineFindings = githubDetector.scan({ path: "auth.js", content: SYNTHETIC_FIXTURES.github.fineGrained });
assert(ghFineFindings.length === 1, "Detected fine-grained GitHub PAT (github_pat_)");

// 6. JWT Detector Tests
console.log("\n\x1b[36m[Testing JWT Detector]\x1b[0m");
const jwtFindings = jwtDetector.scan({ path: "session.js", content: SYNTHETIC_FIXTURES.jwt.valid });
assert(jwtFindings.length === 1, "Detected valid structural JWT token");
const jwtInvalid = jwtDetector.scan({ path: "session.js", content: SYNTHETIC_FIXTURES.jwt.invalid });
assert(jwtInvalid.length === 0, "Rejected invalid non-JWT string");

// 7. Private Key Detector Tests
console.log("\n\x1b[36m[Testing Private Key Detector]\x1b[0m");
const pkFindings = privateKeyDetector.scan({ path: "id_rsa", content: SYNTHETIC_FIXTURES.privateKey.rsa });
assert(pkFindings.length === 1, "Detected RSA Private Key header");
assert(pkFindings[0].severity === "CRITICAL", "Private key severity is CRITICAL");

// 8. Database Credential Detector Tests
console.log("\n\x1b[36m[Testing Database Detector]\x1b[0m");
const dbFindings = databaseDetector.scan({ path: "orm.js", content: SYNTHETIC_FIXTURES.database.postgres });
assert(dbFindings.length === 1, "Detected database URI with embedded password");

// 9. Generic Detector Tests
console.log("\n\x1b[36m[Testing Generic Detector]\x1b[0m");
const genericFindings = genericDetector.scan({ path: ".env", content: SYNTHETIC_FIXTURES.generic.apiKey });
assert(genericFindings.length === 1, "Detected generic API key assignment");
const genericPlaceholder = genericDetector.scan({ path: ".env", content: SYNTHETIC_FIXTURES.generic.placeholder });
assert(genericPlaceholder.length === 0, "Rejected generic placeholder key");

console.log("\n============================================================");
console.log(`Phase 1 Results: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`);
console.log("============================================================\n");

// Run Phase 2 Git & CLI Tests
import("./gitScanner.test.js").then(() => {
  if (failed > 0) {
    process.exit(1);
  }
}).catch(err => {
  console.error("Phase 2 test failure:", err);
  process.exit(1);
});
