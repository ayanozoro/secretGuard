import { Repository } from "@secretguard/database";

/**
 * Creates and persists a new repository to monitor.
 * 
 * @param {Object} repoData 
 * @returns {Promise<Object>}
 */
export async function create(repoData) {
  return await Repository.create(repoData);
}

/**
 * Finds a repository by its MongoDB ObjectId.
 * 
 * @param {string|mongoose.Types.ObjectId} id 
 * @returns {Promise<Object|null>}
 */
export async function findById(id) {
  if (!id) return null;
  return await Repository.findById(id).populate("ownerId", "name email");
}

/**
 * Finds a repository by URL.
 * 
 * @param {string} url 
 * @returns {Promise<Object|null>}
 */
export async function findByUrl(url) {
  if (!url) return null;
  return await Repository.findOne({
    $or: [{ url: url.trim() }, { repoUrl: url.trim() }]
  });
}

/**
 * Lists repositories belonging to a specific owner or user.
 * 
 * @param {string|mongoose.Types.ObjectId} ownerId 
 * @param {Object} pagination
 * @returns {Promise<{ repositories: Array<Object>, total: number, page: number, totalPages: number }>}
 */
export async function findByOwner(ownerId, { page = 1, limit = 20 } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const query = {
    $or: [{ ownerId }, { userId: ownerId }]
  };

  const [repositories, total] = await Promise.all([
    Repository.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    Repository.countDocuments(query)
  ]);

  return {
    repositories,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1
  };
}

/**
 * Lists all repositories across the organization with pagination.
 * 
 * @param {Object} params
 * @returns {Promise<{ repositories: Array<Object>, total: number, page: number, totalPages: number }>}
 */
export async function listAll({ page = 1, limit = 20, search } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const query = {};
  if (search && typeof search === "string" && search.trim()) {
    const term = search.trim();
    query.$or = [
      { name: { $regex: term, $options: "i" } },
      { url: { $regex: term, $options: "i" } }
    ];
  }

  const [repositories, total] = await Promise.all([
    Repository.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("ownerId", "name email"),
    Repository.countDocuments(query)
  ]);

  return {
    repositories,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1
  };
}

/**
 * Updates a repository record.
 * 
 * @param {string|mongoose.Types.ObjectId} id 
 * @param {Object} updateData 
 * @returns {Promise<Object|null>}
 */
export async function updateById(id, updateData) {
  return await Repository.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
}

/**
 * Updates finding metrics and scan timestamp on a repository after a scan completes.
 * 
 * @param {string|mongoose.Types.ObjectId} id 
 * @param {Object} stats
 * @returns {Promise<Object|null>}
 */
export async function updateStats(id, stats = {}) {
  const update = {
    $set: {
      lastScanAt: stats.lastScanAt || new Date(),
      ...(stats.openFindingsCount !== undefined && { openFindingsCount: stats.openFindingsCount }),
      ...(stats.criticalFindingsCount !== undefined && { criticalFindingsCount: stats.criticalFindingsCount }),
      ...(stats.highFindingsCount !== undefined && { highFindingsCount: stats.highFindingsCount }),
      ...(stats.mediumFindingsCount !== undefined && { mediumFindingsCount: stats.mediumFindingsCount }),
      ...(stats.lowFindingsCount !== undefined && { lowFindingsCount: stats.lowFindingsCount })
    },
    $inc: {
      totalScans: stats.incrementScanCount ? 1 : 0
    }
  };

  return await Repository.findByIdAndUpdate(id, update, { new: true });
}

/**
 * Deletes a repository record.
 * 
 * @param {string|mongoose.Types.ObjectId} id 
 * @returns {Promise<Object|null>}
 */
export async function deleteById(id) {
  return await Repository.findByIdAndDelete(id);
}

export default {
  create,
  findById,
  findByUrl,
  findByOwner,
  listAll,
  updateById,
  updateStats,
  deleteById
};
