import { ScanManager } from "./scanner/scanManager.js";
import { scanDirectory } from "./scanner/fileScanner.js";
import { DetectorRegistry, DEFAULT_DETECTORS } from "./detectors/index.js";
import { Finding } from "./models/finding.js";
import { RULES } from "./rules/detectorRules.js";
import { calculateShannonEntropy, calculateCharsetDiversity } from "./analyzers/entropyAnalyzer.js";
import { analyzeContext } from "./analyzers/contextAnalyzer.js";
import { calculateConfidence } from "./analyzers/confidenceAnalyzer.js";
import { calculateRisk } from "./analyzers/riskAnalyzer.js";
import { isPlaceholder } from "./filters/placeholderFilter.js";
import { isFalsePositive } from "./filters/falsePositiveFilter.js";
import { scanGitRepository, scanGitHistory, runGitCommand, isGitRepo } from "./git/index.js";
import { logger } from "../../shared/src/utils/logger.js";

export {
  ScanManager,
  scanDirectory,
  scanGitRepository,
  scanGitHistory,
  runGitCommand,
  isGitRepo,
  DetectorRegistry,
  DEFAULT_DETECTORS,
  Finding,
  RULES,
  calculateShannonEntropy,
  calculateCharsetDiversity,
  analyzeContext,
  calculateConfidence,
  calculateRisk,
  isPlaceholder,
  isFalsePositive
};

// CLI execution helper if executed directly
async function runDirect() {
  const target = process.argv[2] || "./test-project";
  logger.banner();
  logger.info(`Starting SecretGuard Scanner on: ${target}`);

  const manager = new ScanManager();
  const results = await manager.scan(target);

  console.log(`\n------------------------------------------------------------`);
  logger.info(`Scan completed in ${results.durationMs}ms`);
  logger.info(`Files Scanned: ${results.totalFilesScanned}`);
  logger.info(`Findings Detected: ${results.totalFindings}`);
  console.log(`------------------------------------------------------------\n`);

  for (const f of results.findings) {
    console.log(`[${f.severity}] ${f.ruleName} (Confidence: ${f.confidence * 100}%, Entropy: ${f.entropy})`);
    console.log(`  File: ${f.filePath}:${f.line}`);
    console.log(`  Masked: ${f.maskedSecret}`);
    console.log(`  Snippet: ${f.snippet}`);
    console.log(`  Remediation: ${f.remediation[0]}\n`);
  }
}

if (process.argv[1] && process.argv[1].endsWith("src\\index.js") || process.argv[1]?.endsWith("src/index.js")) {
  runDirect().catch(err => logger.error("Scan failed:", err));
}
