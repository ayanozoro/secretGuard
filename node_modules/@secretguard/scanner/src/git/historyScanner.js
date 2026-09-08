import { fetchCommitLog, fetchCommitDiff, fetchFileAtHead } from "./gitUtils.js";
import { scanCommit } from "./commitScanner.js";
import { DetectorRegistry } from "../detectors/index.js";

/**
 * Scans the commit history of a Git repository to detect leaked secrets in past commits
 * and identify "Ghost / Dangling Secrets" (secrets deleted from code but lingering in Git history).
 * 
 * @param {string} targetDirectory - Path to the Git repository
 * @param {Object} options - { maxCommits = 100 }
 * @returns {Promise<Object>} { totalCommitsScanned, findings }
 */
export async function scanGitHistory(targetDirectory, options = {}) {
  const maxCommits = options.maxCommits || options.maxDepth || 100;
  const commits = await fetchCommitLog(targetDirectory, maxCommits);
  const registry = new DetectorRegistry();

  const allFindings = [];
  const seenFindingKeys = new Set();

  for (const commit of commits) {
    let diffText = "";
    try {
      diffText = await fetchCommitDiff(targetDirectory, commit.hash);
    } catch {
      continue;
    }

    const commitFindings = scanCommit({ commit, diffText, registry });

    for (const finding of commitFindings) {
      // Deduplicate: same secret in the same file across multiple commits
      const dedupeKey = `${finding.fingerprint}:${finding.filePath}`;

      if (!seenFindingKeys.has(dedupeKey)) {
        seenFindingKeys.add(dedupeKey);

        // Check if secret is a "Ghost / Dangling Secret" (deleted in HEAD)
        const headContent = await fetchFileAtHead(targetDirectory, finding.filePath);
        const isStillInHead = Boolean(headContent && headContent.includes(finding.snippet));

        if (!isStillInHead) {
          finding.metadata.isDeletedInHead = true;
          finding.remediation = [
            "⚠️ DANGLING SECRET: This credential was deleted from current code but remains permanently exposed in Git commit history.",
            "1. Immediately REVOKE and ROTATE this credential with your provider.",
            "2. Purge the secret from all historical commits using git-filter-repo or BFG Repo-Cleaner.",
            "3. Force-push the sanitized history to remote repositories."
          ];
        }

        allFindings.push(finding);
      }
    }
  }

  return {
    totalCommitsScanned: commits.length,
    findings: allFindings
  };
}