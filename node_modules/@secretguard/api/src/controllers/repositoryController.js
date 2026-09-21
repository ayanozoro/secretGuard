import * as repositoryRepo from "../repositories/repositoryRepository.js";
import * as findingRepo from "../repositories/findingRepository.js";

/**
 * Registers a new code repository for secret scanning.
 */
export async function createRepository(req, res, next) {
  try {
    const { name, url, defaultBranch = "main", isPrivate = false } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: "Repository name and url are required"
      });
    }

    const existing = await repositoryRepo.findByUrl(url);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A repository with this URL is already registered"
      });
    }

    const userId = req.user._id || req.user.id;
    const repository = await repositoryRepo.create({
      name: name.trim(),
      url: url.trim(),
      repoUrl: url.trim(),
      defaultBranch: defaultBranch.trim(),
      isPrivate: Boolean(isPrivate),
      ownerId: userId,
      userId
    });

    res.status(201).json({
      success: true,
      message: "Repository registered successfully",
      data: { repository }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Lists repositories monitored by the user/organization.
 */
export async function listRepositories(req, res, next) {
  try {
    const { page, limit, search } = req.query;
    const userId = req.user._id || req.user.id;

    let result;
    if (req.user.role === "ADMIN") {
      result = await repositoryRepo.listAll({ page, limit, search });
    } else {
      result = await repositoryRepo.findByOwner(userId, { page, limit });
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
 * Retrieves repository details along with its latest security metrics breakdown.
 */
export async function getRepositoryById(req, res, next) {
  try {
    const { id } = req.params;
    const repository = await repositoryRepo.findById(id);

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: "Repository not found"
      });
    }

    const metrics = await findingRepo.getMetrics(id);

    res.status(200).json({
      success: true,
      data: {
        repository,
        metrics
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Removes a repository from monitoring.
 */
export async function deleteRepository(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await repositoryRepo.deleteById(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Repository not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Repository deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

export default {
  createRepository,
  listRepositories,
  getRepositoryById,
  deleteRepository
};
