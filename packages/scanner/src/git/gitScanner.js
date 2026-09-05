import { isGitRepo } from "./gitUtils.js";
import { scanGitHistory } from "./historyScanner.js";
import { ScanManager } from "../scanner/scanManager.js";
import { Severity } from "../../../shared/src/constants/enums.js";

/**
 * Unified Git Repository Scanner.
 * Orchestrates working tree scan and historical commit inspection.
 * 
 * @param {string} targetDirectory - Path to the repository
 * @param {Object} options - { includeHistory: boolean, maxCommits: number }
 * @returns {Promise<Object>} Consolidated scan report
 */
export async function scanGitRepository(targetDirectory, options = {}) {
  const startTime = Date.now();

  const isGit = await isGitRepo(targetDirectory);
  if (!isGit) {
    throw new Error(`Directory "${targetDirectory}" is not a valid Git repository.`);
  }

  // 1. Scan Working Tree (Current active files on disk)
  const scanManager = new ScanManager(options);
  const workingTreeResults = await scanManager.scan(targetDirectory);

  const allFindings = [...workingTreeResults.findings];
  const seenFingerprints = new Set(allFindings.map(f => `${f.fingerprint}:${f.filePath}`));
  let totalCommitsScanned = 0;

  // 2. Scan Git Commit History (if requested)
  if (options.includeHistory) {
    const historyResults = await scanGitHistory(targetDirectory, options);
    totalCommitsScanned = historyResults.totalCommitsScanned;

    for (const finding of historyResults.findings) {
      const dedupeKey = `${finding.fingerprint}:${finding.filePath}`;
      const findingJson = finding.toJSON ? finding.toJSON() : finding;

      if (!seenFingerprints.has(dedupeKey)) {
        seenFingerprints.add(dedupeKey);
        allFindings.push(findingJson);
      }
    }
  }

  // 3. Sort findings by Severity then Confidence
  const severityRank = {
    [Severity.CRITICAL]: 4,
    [Severity.HIGH]: 3,
    [Severity.MEDIUM]: 2,
    [Severity.LOW]: 1,
    [Severity.INFO]: 0
  };

  allFindings.sort((a, b) => {
    const rankDiff = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
    if (rankDiff !== 0) return rankDiff;
    return b.confidence - a.confidence;
  });

  // 4. Calculate Severity Breakdown
  const severityCounts = {
    [Severity.CRITICAL]: allFindings.filter(f => f.severity === Severity.CRITICAL).length,
    [Severity.HIGH]: allFindings.filter(f => f.severity === Severity.HIGH).length,
    [Severity.MEDIUM]: allFindings.filter(f => f.severity === Severity.MEDIUM).length,
    [Severity.LOW]: allFindings.filter(f => f.severity === Severity.LOW).length
  };

  const durationMs = Date.now() - startTime;

  return {
    target: targetDirectory,
    isGit: true,
    includeHistory: Boolean(options.includeHistory),
    totalFilesScanned: workingTreeResults.totalFilesScanned,
    totalCommitsScanned,
    totalFindings: allFindings.length,
    severityCounts,
    durationMs,
    findings: allFindings
  };
}