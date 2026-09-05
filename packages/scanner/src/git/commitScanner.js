import { DetectorRegistry } from "../detectors/index.js";

/**
 * Parses a unified git patch diff into structured per-file additions with exact line numbers.
 * 
 * @param {string} diffText - Raw unified diff output from git show
 * @returns {Array<Object>} Array of { path, lines: Array<{ lineNumber, text }> }
 */
export function parseUnifiedDiff(diffText) {
  if (!diffText) return [];

  const files = [];
  let currentFile = null;
  let currentLineNumber = 0;

  const lines = diffText.split(/\r?\n/);

  for (const line of lines) {
    if (line.startsWith("diff --git")) {
      currentFile = null;
    } else if (line.startsWith("+++ b/")) {
      const filePath = line.slice(6).trim();
      currentFile = { path: filePath, lines: [] };
      files.push(currentFile);
    } else if (line.startsWith("@@ ") && currentFile !== null) {
      // Parse hunk header, e.g. @@ -10,3 +45,6 @@ or @@ -1 +1 @@
      const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        currentLineNumber = parseInt(match[1], 10);
      }
    } else if (currentFile !== null && line.startsWith("+") && !line.startsWith("+++")) {
      const addedText = line.slice(1);
      currentFile.lines.push({
        lineNumber: currentLineNumber,
        text: addedText
      });
      currentLineNumber++;
    } else if (currentFile !== null && !line.startsWith("-")) {
      currentLineNumber++;
    }
  }

  return files;
}

/**
 * Scans all newly added lines within a single commit's diff against the security detector registry.
 * 
 * @param {Object} params
 * @param {Object} params.commit - Commit metadata { hash, author, date, message }
 * @param {string} params.diffText - Raw patch diff text
 * @param {DetectorRegistry} params.registry - Security detector registry
 * @returns {Array<Object>} List of findings tagged with commit metadata
 */
export function scanCommit({ commit, diffText, registry = new DetectorRegistry() }) {
  const parsedFiles = parseUnifiedDiff(diffText);
  const findings = [];
  const detectors = registry.getDetectors();

  for (const file of parsedFiles) {
    if (!file.lines || file.lines.length === 0) continue;

    const virtualFile = {
      path: file.path,
      content: file.lines.map(l => l.text).join("\n"),
      lines: file.lines.map(l => l.text)
    };

    for (const detector of detectors) {
      try {
        const rawFindings = detector.scan(virtualFile);

        for (const finding of rawFindings) {
          // Remap relative line index (1-based) to actual file line number in this commit
          const originalLineObj = file.lines[finding.line - 1];
          const mappedLine = originalLineObj ? originalLineObj.lineNumber : finding.line;

          finding.line = mappedLine;
          finding.metadata = {
            ...finding.metadata,
            commitHash: commit.hash,
            shortHash: commit.hash ? commit.hash.slice(0, 7) : "",
            commitAuthor: commit.author,
            commitDate: commit.date,
            commitMessage: commit.message
          };

          findings.push(finding);
        }
      } catch (err) {
        console.error(`Detector ${detector.name} failed on commit diff for ${file.path}:`, err.message);
      }
    }
  }

  return findings;
}
