import path from "path";
import * as scanRepo from "../repositories/scanRepository.js";
import * as repositoryRepo from "../repositories/repositoryRepository.js";
import * as findingRepo from "../repositories/findingRepository.js";
import { ScanManager, scanGitRepository, isGitRepo } from "@secretguard/scanner";
import { generateFingerprint } from "@secretguard/security";

/**
 * Triggers an on-demand secret scan for a registered repository.
 */
export async function triggerScan(req, res, next) {
  try {
    const { repositoryId, targetPath, includeHistory = false, maxCommits = 100 } = req.body;

    if (!repositoryId) {
      return res.status(400).json({
        success: false,
        message: "repositoryId is required"
      });
    }

    const repository = await repositoryRepo.findById(repositoryId);
    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found"
      });
    }

    // Resolve scan directory (fallback to repository URL if local path or test directory)
    const scanDir = targetPath
      ? path.resolve(process.cwd(), targetPath)
      : path.resolve(process.cwd(), "./test-project");

    const userId = req.user._id || req.user.id;

    // 1. Create Scan record in RUNNING status
    const scan = await scanRepo.create({
      repositoryId: repository._id,
      triggeredBy: userId,
      trigger: "MANUAL",
      status: "RUNNING",
      branch: repository.defaultBranch || "main"
    });

    try {
      const isGit = await isGitRepo(scanDir);
      let scanResult;

      if (includeHistory && isGit) {
        scanResult = await scanGitRepository(scanDir, {
          includeHistory: true,
          maxCommits: parseInt(maxCommits, 10) || 100
        });
      } else {
        const manager = new ScanManager();
        scanResult = await manager.scan(scanDir);
      }

      // 2. Map and persist findings with Zero-Plaintext safety
      const findingsToInsert = [];

      for (const f of scanResult.findings || []) {
        const fingerprint = f.fingerprint || generateFingerprint(
          f.maskedSecret || f.secret || f.snippet,
          repository._id.toString()
        );

        // Deduplication check: check if already exists for this repo
        const existing = await findingRepo.findByFingerprint(repository._id, fingerprint);

        if (!existing) {
          findingsToInsert.push({
            scanId: scan._id,
            repositoryId: repository._id,
            fingerprint,
            type: f.type || "GENERIC_SECRET",
            ruleId: f.ruleId,
            ruleName: f.ruleName,
            filePath: f.filePath,
            line: f.line || 1,
            column: f.column || 1,
            variable: f.variable || null,
            maskedSecret: f.maskedSecret,
            snippet: f.snippet || "",
            confidence: f.confidence || 0.8,
            severity: f.severity || "MEDIUM",
            entropy: f.entropy || 0,
            status: "OPEN",
            remediation: f.remediation || [],
            metadata: f.metadata || {}
          });
        }
      }

      if (findingsToInsert.length > 0) {
        await findingRepo.bulkCreateFindings(findingsToInsert);
      }

      // 3. Update Scan record with completed status
      const updatedScan = await scanRepo.updateStatus(scan._id, {
        status: "COMPLETED",
        totalFilesScanned: scanResult.totalFilesScanned || 0,
        totalCommitsScanned: scanResult.totalCommitsScanned || 0,
        totalFindings: (scanResult.findings || []).length,
        severityCounts: {
          critical: scanResult.severityCounts?.CRITICAL || 0,
          high: scanResult.severityCounts?.HIGH || 0,
          medium: scanResult.severityCounts?.MEDIUM || 0,
          low: scanResult.severityCounts?.LOW || 0
        },
        durationMs: scanResult.durationMs || 0
      });

      // 4. Update Repository aggregate metrics
      const metrics = await findingRepo.getMetrics(repository._id);
      await repositoryRepo.updateStats(repository._id, {
        incrementScanCount: true,
        lastScanAt: new Date(),
        openFindingsCount: metrics.status.OPEN,
        criticalFindingsCount: metrics.severity.CRITICAL,
        highFindingsCount: metrics.severity.HIGH,
        mediumFindingsCount: metrics.severity.MEDIUM,
        lowFindingsCount: metrics.severity.LOW
      });

      res.status(200).json({
        success: true,
        message: "Scan executed successfully",
        data: {
          scan: updatedScan,
          newFindingsCount: findingsToInsert.length,
          totalFindingsDetected: (scanResult.findings || []).length
        }
      });
    } catch (scanErr) {
      await scanRepo.updateStatus(scan._id, {
        status: "FAILED",
        errorMessage: scanErr.message
      });
      throw scanErr;
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Lists scan records with pagination.
 */
export async function listScans(req, res, next) {
  try {
    const { repositoryId, page, limit } = req.query;

    let result;
    if (repositoryId) {
      result = await scanRepo.findByRepository(repositoryId, { page, limit });
    } else {
      result = await scanRepo.listAll({ page, limit });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves details of a specific scan execution.
 */
export async function getScanById(req, res, next) {
  try {
    const { id } = req.params;
    const scan = await scanRepo.findById(id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan record not found"
      });
    }

    const findingsResult = await findingRepo.findWithFilters({ scanId: id, limit: 100 });

    res.status(200).json({
      success: true,
      data: {
        scan,
        findings: findingsResult.findings
      }
    });
  } catch (error) {
    next(error);
  }
}

export default {
  triggerScan,
  listScans,
  getScanById
};
