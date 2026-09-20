import { generateApiKeyToken, generateToken, verifyToken } from "../../apps/api/src/services/authService.js";
import * as userRepo from "../../apps/api/src/repositories/userRepository.js";
import * as findingRepo from "../../apps/api/src/repositories/findingRepository.js";
import * as repositoryRepo from "../../apps/api/src/repositories/repositoryRepository.js";
import * as scanRepo from "../../apps/api/src/repositories/scanRepository.js";
import app from "../../apps/api/src/app.js";

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

console.log("\n\x1b[36m[Testing API Layer: Auth Services, Repositories, & Express App]\x1b[0m");

// 1. Auth Service Unit Tests
const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  email: "security-lead@secretguard.io",
  role: "ADMIN"
};

const token = generateToken(mockUser);
assert(typeof token === "string" && token.split(".").length === 3, "JWT generated with three-part signature");

const decoded = verifyToken(token);
assert(decoded.id === mockUser._id, "Decoded token preserves user ID claim");
assert(decoded.email === mockUser.email, "Decoded token preserves email claim");
assert(decoded.role === "ADMIN", "Decoded token preserves role claim");

const apiKey = generateApiKeyToken();
assert(apiKey.startsWith("sg_live_"), "Generated API key has sg_live_ prefix");
assert(apiKey.length === 56, `Generated API key has correct 56-character length (got ${apiKey.length})`);

// 2. User Repository Function Exports
assert(typeof userRepo.findByEmail === "function", "userRepo exports findByEmail");
assert(typeof userRepo.findById === "function", "userRepo exports findById");
assert(typeof userRepo.findByApiKey === "function", "userRepo exports findByApiKey");
assert(typeof userRepo.create === "function", "userRepo exports create");
assert(typeof userRepo.update === "function", "userRepo exports update");
assert(typeof userRepo.deleteById === "function", "userRepo exports deleteById");

// 3. Finding Repository Function Exports
assert(typeof findingRepo.createFinding === "function", "findingRepo exports createFinding");
assert(typeof findingRepo.bulkCreateFindings === "function", "findingRepo exports bulkCreateFindings");
assert(typeof findingRepo.findById === "function", "findingRepo exports findById");
assert(typeof findingRepo.findWithFilters === "function", "findingRepo exports findWithFilters");
assert(typeof findingRepo.updateStatus === "function", "findingRepo exports updateStatus");
assert(typeof findingRepo.getMetrics === "function", "findingRepo exports getMetrics");
assert(typeof findingRepo.findByFingerprint === "function", "findingRepo exports findByFingerprint");

// 4. Status Transition Validation
let rejectedInvalidStatus = false;
try {
  await findingRepo.updateStatus("507f1f77bcf86cd799439011", { status: "INVALID_STATUS_XYZ" });
} catch (err) {
  rejectedInvalidStatus = err.message.includes("Invalid status");
}
assert(rejectedInvalidStatus, "findingRepo.updateStatus rejects invalid status values");

// 5. Repository & Scan Repositories
assert(typeof repositoryRepo.create === "function", "repositoryRepo exports create");
assert(typeof repositoryRepo.updateStats === "function", "repositoryRepo exports updateStats");
assert(typeof scanRepo.create === "function", "scanRepo exports create");
assert(typeof scanRepo.updateStatus === "function", "scanRepo exports updateStatus");

// 6. Express App Structure
assert(typeof app === "function", "Express app initializes successfully");
assert(app._router && app._router.stack.length > 0, "Express router middleware stack is populated");

console.log("\n============================================================");
console.log(`API Layer Tests: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`);
console.log("============================================================\n");

if (failed > 0) {
  process.exit(1);
}
