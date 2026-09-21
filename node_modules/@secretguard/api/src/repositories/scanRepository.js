import { Scan } from "@secretguard/database";

/**
 * Creates and persists a new scan run record.
 * 
 * @param {Object} scanData 
 * @returns {Promise<Object>}
 */
export async function create(scanData) {
  return await Scan.create({
    startedAt: new Date(),
    ...scanData
  });
}

/**
 * Finds a scan record by its MongoDB ObjectId.
 * 
 * @param {string|mongoose.Types.ObjectId} id 
 * @returns {Promise<Object|null>}
 */
export async function findById(id) {
  if (!id) return null;
  return await Scan.findById(id)
    .populate("repositoryId", "name url defaultBranch")
    .populate("triggeredBy", "name email");
}

/**
 * Lists scan records for a given repository with pagination.
 * 
 * @param {string|mongoose.Types.ObjectId} repositoryId 
 * @param {Object} pagination
 * @returns {Promise<{ scans: Array<Object>, total: number, page: number, totalPages: number }>}
 */
export async function findByRepository(repositoryId, { page = 1, limit = 20 } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const query = { repositoryId };

  const [scans, total] = await Promise.all([
    Scan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("triggeredBy", "name email"),
    Scan.countDocuments(query)
  ]);

  return {
    scans,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1
  };
}

/**
 * Lists all scans across the platform with pagination.
 * 
 * @param {Object} pagination
 * @returns {Promise<{ scans: Array<Object>, total: number, page: number, totalPages: number }>}
 */
export async function listAll({ page = 1, limit = 20 } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const [scans, total] = await Promise.all([
    Scan.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("repositoryId", "name url")
      .populate("triggeredBy", "name email"),
    Scan.countDocuments()
  ]);

  return {
    scans,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1
  };
}

/**
 * Updates status and scan metrics upon completion or failure.
 * 
 * @param {string|mongoose.Types.ObjectId} id 
 * @param {Object} updateData 
 * @returns {Promise<Object|null>}
 */
export async function updateStatus(id, updateData = {}) {
  const update = {
    $set: {
      ...(updateData.status && { status: updateData.status }),
      ...(updateData.totalFilesScanned !== undefined && { totalFilesScanned: updateData.totalFilesScanned }),
      ...(updateData.totalCommitsScanned !== undefined && { totalCommitsScanned: updateData.totalCommitsScanned }),
      ...(updateData.totalFindings !== undefined && { totalFindings: updateData.totalFindings }),
      ...(updateData.severityCounts && { severityCounts: updateData.severityCounts }),
      ...(updateData.durationMs !== undefined && { durationMs: updateData.durationMs }),
      ...(updateData.errorMessage !== undefined && { errorMessage: updateData.errorMessage }),
      completedAt: updateData.completedAt || new Date()
    }
  };

  return await Scan.findByIdAndUpdate(id, update, { new: true });
}

export default {
  create,
  findById,
  findByRepository,
  listAll,
  updateStatus
};
