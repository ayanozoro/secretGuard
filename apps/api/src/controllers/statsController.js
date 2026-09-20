import { Repository, Scan, Finding } from "@secretguard/database";

/**
 * Returns aggregated platform-wide security statistics for executive and dev dashboards.
 */
export async function getOverviewStats(req, res, next) {
  try {
    const [
      totalRepositories,
      totalScans,
      totalFindings,
      openFindings,
      resolvedFindings,
      criticalOpen,
      highOpen,
      topRules,
      recentScans
    ] = await Promise.all([
      Repository.countDocuments(),
      Scan.countDocuments(),
      Finding.countDocuments(),
      Finding.countDocuments({ status: "OPEN" }),
      Finding.countDocuments({ status: "RESOLVED" }),
      Finding.countDocuments({ status: "OPEN", severity: "CRITICAL" }),
      Finding.countDocuments({ status: "OPEN", severity: "HIGH" }),
      Finding.aggregate([
        { $match: { status: "OPEN" } },
        { $group: { _id: "$ruleName", count: { $sum: 1 }, severity: { $first: "$severity" } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Scan.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("repositoryId", "name url")
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRepositories,
          totalScans,
          totalFindings,
          openFindings,
          resolvedFindings,
          criticalOpen,
          highOpen
        },
        topVulnerabilities: topRules.map(r => ({
          name: r._id,
          count: r.count,
          severity: r.severity
        })),
        recentScans
      }
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getOverviewStats
};
