import path from "path";
import { ScanManager } from "../packages/scanner/src/scanner/scanManager.js";
import { logger } from "../packages/shared/src/utils/logger.js";

async function main() {
  const targetDir = process.argv[2] || "./test-project";
  const resolvedPath = path.resolve(process.cwd(), targetDir);

  logger.banner();
  logger.info(`Scanning target directory: ${resolvedPath}\n`);

  const scanner = new ScanManager();
  const results = await scanner.scan(resolvedPath);

  console.log(`------------------------------------------------------------`);
  logger.info(`Scan Finished in ${results.durationMs}ms`);
  logger.info(`Total Files Evaluated: ${results.totalFilesScanned}`);
  logger.info(`Total Findings Detected: ${results.totalFindings}`);
  console.log(`Severity Breakdown: Critical=${results.severityCounts.CRITICAL}, High=${results.severityCounts.HIGH}, Medium=${results.severityCounts.MEDIUM}, Low=${results.severityCounts.LOW}`);
  console.log(`------------------------------------------------------------\n`);

  if (results.findings.length === 0) {
    logger.success("No leaked secrets detected. Directory is clean!");
    return;
  }

  for (const f of results.findings) {
    console.log(`[${f.severity}] ${f.ruleName} (Confidence: ${(f.confidence * 100).toFixed(0)}%, Entropy: ${f.entropy})`);
    console.log(`  Location: ${f.filePath}:${f.line}`);
    console.log(`  Masked Secret: ${f.maskedSecret}`);
    console.log(`  Snippet: ${f.snippet}`);
    console.log(`  Remediation: ${f.remediation[0]}\n`);
  }
}

main().catch(err => {
  logger.error("Scan error:", err);
  process.exit(1);
});
