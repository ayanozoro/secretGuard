import * as findingRepo from "../repositories/findingRepository.js";
import * as repositoryRepo from "../repositories/repositoryRepository.js";

/**
 * Searches and paginates findings with flexible filters.
 */
export async function listFindings(req, res, next) {
  try {
    const { repositoryId, scanId, severity, status, search, page, limit } = req.query;

    const result = await findingRepo.findWithFilters({
      repositoryId,
      scanId,
      severity,
      status,
      search,
      page,
      limit
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves a single finding's detailed view.
 */
export async function getFindingById(req, res, next) {
  try {
    const { id } = req.params;
    const finding = await findingRepo.findById(id);

    if (!finding) {
      return res.status(404).json({
        success: false,
        message: "Finding not found"
      });
    }

    res.status(200).json({
      success: true,
      data: { finding }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Updates the triage status of a secret finding (e.g., RESOLVED, FALSE_POSITIVE, IGNORED).
 */
export async function updateFindingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, resolutionNote } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const resolvedBy = req.user?.email || req.user?.name || "system";
    const updatedFinding = await findingRepo.updateStatus(id, {
      status,
      resolutionNote,
      resolvedBy
    });

    if (!updatedFinding) {
      return res.status(404).json({
        success: false,
        message: "Finding not found"
      });
    }

    // Synchronize parent repository metrics
    const repoId = updatedFinding.repositoryId;
    if (repoId) {
      try {
        const metrics = await findingRepo.getMetrics(repoId);
        await repositoryRepo.updateStats(repoId, {
          openFindingsCount: metrics.status.OPEN,
          criticalFindingsCount: metrics.severity.CRITICAL,
          highFindingsCount: metrics.severity.HIGH,
          mediumFindingsCount: metrics.severity.MEDIUM,
          lowFindingsCount: metrics.severity.LOW
        });
      } catch (syncErr) {
        // Non-blocking log
        console.warn("Failed to sync repository stats after finding status change:", syncErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Finding marked as ${updatedFinding.status}`,
      data: { finding: updatedFinding }
    });
  } catch (error) {
    next(error);
  }
}

export default {
  listFindings,
  getFindingById,
  updateFindingStatus
};
