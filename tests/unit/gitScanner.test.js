import { parseUnifiedDiff, scanCommit } from "../../packages/scanner/src/git/commitScanner.js";
import { parseArguments } from "../../apps/cli/src/options.js";
import { formatJsonReport } from "../../apps/cli/src/formatters/jsonFormatter.js";
import { DetectorRegistry } from "../../packages/scanner/src/detectors/index.js";

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

console.log("\n\x1b[36m[Testing Unified Diff Parser & Git Commit Scanner]\x1b[0m");

const sampleDiff = `
diff --git a/config.js b/config.js
index e69de29..d95f3ad 100644
--- a/config.js
+++ b/config.js
@@ -0,0 +1,4 @@
+const AWS_KEY = "AKIAIOSFODNN7EXAMPLE";
+const GITHUB_PAT = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";
+const USER = "normalUser";
`;

const parsed = parseUnifiedDiff(sampleDiff);
assert(parsed.length === 1, "Parsed 1 file from unified diff");
assert(parsed[0].path === "config.js", "Captured correct file path (config.js)");
assert(parsed[0].lines.length === 3, `Extracted 3 added lines (got: ${parsed[0].lines.length})`);
assert(parsed[0].lines[0].lineNumber === 1, "Line 1 mapped correctly");
assert(parsed[0].lines[1].lineNumber === 2, "Line 2 mapped correctly");

const commitMeta = {
  hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  author: "Security Engineer <sec@example.com>",
  date: "2026-09-01T10:00:00Z",
  message: "Add cloud config credentials"
};

const registry = new DetectorRegistry();
const commitFindings = scanCommit({ commit: commitMeta, diffText: sampleDiff, registry });
assert(commitFindings.length === 2, `Detected 2 secrets in commit diff (got: ${commitFindings.length})`);
assert(commitFindings[0].metadata.commitHash === commitMeta.hash, "Attached full commit hash to finding");
assert(commitFindings[0].metadata.shortHash === "a1b2c3d", "Attached short hash to finding");
assert(commitFindings[0].metadata.commitAuthor === commitMeta.author, "Attached commit author to finding");

console.log("\n\x1b[36m[Testing CLI Options Parser]\x1b[0m");
const opt1 = parseArguments(["scan", "./src", "--history", "--severity", "high", "--json"]);
assert(opt1.command === "scan", "Parsed scan command");
assert(opt1.includeHistory === true, "Parsed --history flag");
assert(opt1.minSeverity === "HIGH", "Parsed --severity HIGH");
assert(opt1.json === true, "Parsed --json flag");

const opt2 = parseArguments(["--exit-zero", "--max-depth", "50"]);
assert(opt2.exitZero === true, "Parsed --exit-zero flag");
assert(opt2.maxCommits === 50, "Parsed --max-depth flag");

console.log("\n\x1b[36m[Testing JSON Report Formatter]\x1b[0m");
const mockScanResult = {
  target: "./test-project",
  isGit: true,
  includeHistory: true,
  totalFilesScanned: 5,
  totalCommitsScanned: 10,
  totalFindings: commitFindings.length,
  durationMs: 15,
  severityCounts: { CRITICAL: 1, HIGH: 1, MEDIUM: 0, LOW: 0 },
  findings: commitFindings
};
const jsonReport = formatJsonReport(mockScanResult);
const parsedJson = JSON.parse(jsonReport);
assert(parsedJson.scanner === "SecretGuard", "JSON report has scanner header");
assert(parsedJson.summary.totalCommitsScanned === 10, "JSON report has correct commit count");
assert(parsedJson.findings.length === 2, "JSON report contains finding items");

console.log("\n============================================================");
console.log(`Git Scanner & CLI Tests: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`);
console.log("============================================================\n");

if (failed > 0) {
  process.exit(1);
}
