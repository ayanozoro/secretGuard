import mongoose from "mongoose";
import { Finding } from "@secretguard/database";

/**
 * Persists a single finding into the database.
 * 
 * @param {Object} data - Finding data adhering to FindingSchema
 * @returns {Promise<Object>} Created Finding document
 */
export async function createFinding(data) {
  return await Finding.create(data);
}

/**
 * Persists multiple findings in bulk (e.g. from an entire scan run).
 * Uses unordered insert to continue inserting if individual documents fail validation.
 * 
 * @param {Array<Object>} findingsArray - Array of finding objects
 * @returns {Promise<Array<Object>>} Inserted Finding documents
 */
export async function bulkCreateFindings(findingsArray = []) {
  if (!findingsArray || findingsArray.length === 0) {
    return [];
  }
  return await Finding.insertMany(findingsArray, { ordered: false });
}

/**
 * Retrieves a finding by its MongoDB ObjectId, populating repository and scan references.
 * 
 * @param {string|mongoose.Types.ObjectId} id - Finding ObjectId
 * @returns {Promise<Object|null>} Finding document or null
 */
export async function findById(id) {
  return await Finding.findById(id)
    .populate("repositoryId", "name url defaultBranch")
    .populate("scanId", "trigger branch commitHash createdAt");
}

/**
 * Searches and paginates findings based on flexible query filters.
 * 
 * @param {Object} filters
 * @param {string} [filters.repositoryId] - Filter by repository
 * @param {string} [filters.scanId] - Filter by scan execution
 * @param {string} [filters.severity] - CRITICAL, HIGH, MEDIUM, LOW, INFO
 * @param {string} [filters.status] - OPEN, RESOLVED, FALSE_POSITIVE, IGNORED, REVOKED
 * @param {string} [filters.search] - Free-text search matching ruleName, filePath, or type
 * @param {number} [filters.page=1] - 1-based page number
 * @param {number} [filters.limit=20] - Maximum records per page
 * @returns {Promise<{ findings: Array<Object>, pagination: { total: number, page: number, limit: number, totalPages: number } }>}
 */
export async function findWithFilters({
  repositoryId,
  scanId,
  severity,
  status,
  search,
  page = 1,
  limit = 20
} = {}) {
  const query = {};

  if (repositoryId) {
    query.repositoryId = repositoryId;
  }

  if (scanId) {
    query.scanId = scanId;
  }

  if (severity) {
    query.severity = severity.toUpperCase();
  }

  if (status) {
    query.status = status.toUpperCase();
  }

  if (search && typeof search === "string" && search.trim()) {
    const term = search.trim();
    query.$or = [
      { ruleName: { $regex: term, $options: "i" } },
      { filePath: { $regex: term, $options: "i" } },
      { type: { $regex: term, $options: "i" } }
    ];
  }

  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const [findings, total] = await Promise.all([
    Finding.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("repositoryId", "name")
      .populate("scanId", "trigger commitHash"),
    Finding.countDocuments(query)
  ]);

  return {
    findings,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1
    }
  };
}

/**
 * Updates the lifecycle triage status of a secret finding (e.g. RESOLVED, FALSE_POSITIVE).
 * 
 * @param {string|mongoose.Types.ObjectId} id - Finding ObjectId
 * @param {Object} updateData
 * @param {string} updateData.status - Target status: RESOLVED, FALSE_POSITIVE, IGNORED, REVOKED, OPEN
 * @param {string} [updateData.resolutionNote] - Audit note explaining the reason
 * @param {string} [updateData.resolvedBy] - User or system identifier performing triage
 * @returns {Promise<Object|null>} Updated Finding document
 */
export async function updateStatus(id, { status, resolutionNote, resolvedBy } = {}) {
  const allowedStatuses = ["OPEN", "RESOLVED", "FALSE_POSITIVE", "IGNORED", "REVOKED"];
  const upperStatus = status ? status.toUpperCase() : null;

  if (!upperStatus || !allowedStatuses.includes(upperStatus)) {
    throw new Error(`Invalid status "${status}". Allowed values: ${allowedStatuses.join(", ")}`);
  }

  const update = {
    $set: {
      status: upperStatus,
      "metadata.resolvedAt": upperStatus === "OPEN" ? null : new Date(),
      ...(resolutionNote ? { "metadata.resolutionNote": resolutionNote } : {}),
      ...(resolvedBy ? { "metadata.resolvedBy": resolvedBy } : {})
    }
  };

  return await Finding.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true
  });
}

/**
 * Computes aggregated security posture metrics for a repository across severities and statuses.
 * 
 * @param {string|mongoose.Types.ObjectId} repositoryId - Repository ObjectId
 * @returns {Promise<{ total: number, severity: Object, status: Object }>}
 */
export async function getMetrics(repositoryId) {
  if (!repositoryId) {
    throw new Error("repositoryId is required to calculate metrics");
  }

  const repoObjectId = mongoose.Types.ObjectId.isValid(repositoryId)
    ? new mongoose.Types.ObjectId(repositoryId)
    : repositoryId;

  const [aggregationResult] = await Finding.aggregate([
    { $match: { repositoryId: repoObjectId } },
    {
      $facet: {
        bySeverity: [
          { $group: { _id: "$severity", count: { $sum: 1 } } }
        ],
        byStatus: [
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ],
        totalCount: [
          { $count: "count" }
        ]
      }
    }
  ]);

  const metrics = {
    total: aggregationResult?.totalCount?.[0]?.count || 0,
    severity: {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFO: 0
    },
    status: {
      OPEN: 0,
      RESOLVED: 0,
      FALSE_POSITIVE: 0,
      IGNORED: 0,
      REVOKED: 0
    }
  };

  if (aggregationResult?.bySeverity) {
    for (const item of aggregationResult.bySeverity) {
      if (item._id && metrics.severity[item._id] !== undefined) {
        metrics.severity[item._id] = item.count;
      }
    }
  }

  if (aggregationResult?.byStatus) {
    for (const item of aggregationResult.byStatus) {
      if (item._id && metrics.status[item._id] !== undefined) {
        metrics.status[item._id] = item.count;
      }
    }
  }

  return metrics;
}

/**
 * Finds an existing finding by repository and deterministic SHA-256 fingerprint.
 * Essential for deduplicating repeated findings across commits or scans.
 * 
 * @param {string|mongoose.Types.ObjectId} repositoryId - Repository ObjectId
 * @param {string} fingerprint - SHA-256 fingerprint hash
 * @returns {Promise<Object|null>} Finding document if found, otherwise null
 */
export async function findByFingerprint(repositoryId, fingerprint) {
  if (!repositoryId || !fingerprint) {
    return null;
  }
  return await Finding.findOne({ repositoryId, fingerprint });
}

export default {
  createFinding,
  bulkCreateFindings,
  findById,
  findWithFilters,
  updateStatus,
  getMetrics,
  findByFingerprint
};
