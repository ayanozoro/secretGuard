import { scanDirectory } from "./fileScanner.js";
import { DetectorRegistry } from "../detectors/index.js";
import { Severity } from "../../../shared/src/constants/enums.js";

/**
 * Main Scan Manager orchestrating the SecretGuard scan lifecycle.
 */
export class ScanManager {
  constructor(options = {}) {
    this.options = options;
    this.registry = new DetectorRegistry();
  }

  /**
   * Registers an additional custom detector plugin.
   */
  registerDetector(detector) {
    this.registry.register(detector);
  }

  /**
   * Executes a scan on a given directory path.
   * 
   * @param {string} targetDir - Target directory to scan
   * @returns {Promise<Object>} Scan results summary with findings and metrics
   */
  async scan(targetDir) {
    const startTime = Date.now();
    const files = await scanDirectory(targetDir, this.options);
    const allFindings = [];
    const seenFingerprints = new Set();

    const detectors = this.registry.getDetectors();

    for (const file of files) {
      for (const detector of detectors) {
        try {
          const findings = detector.scan(file);
          for (const finding of findings) {
            // Deduplicate exact same secret finding in same file & line
            if (!seenFingerprints.has(finding.id)) {
              seenFingerprints.add(finding.id);
              allFindings.push(finding);
            }
          }
        } catch (err) {
          // Keep scanning remaining files if a single detector has an issue
          console.error(`Detector ${detector.name} failed on ${file.path}:`, err.message);
        }
      }
    }

    const durationMs = Date.now() - startTime;

    // Sort findings by Severity (CRITICAL -> HIGH -> MEDIUM -> LOW) then confidence desc
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

    const severityCounts = {
      [Severity.CRITICAL]: allFindings.filter(f => f.severity === Severity.CRITICAL).length,
      [Severity.HIGH]: allFindings.filter(f => f.severity === Severity.HIGH).length,
      [Severity.MEDIUM]: allFindings.filter(f => f.severity === Severity.MEDIUM).length,
      [Severity.LOW]: allFindings.filter(f => f.severity === Severity.LOW).length
    };

    return {
      target: targetDir,
      totalFilesScanned: files.length,
      totalFindings: allFindings.length,
      severityCounts,
      durationMs,
      findings: allFindings.map(f => f.toJSON ? f.toJSON() : f)
    };
  }
}
