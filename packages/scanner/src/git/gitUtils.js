import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/**
 * Safely executes a git CLI command using an argument array.
 * Bypasses shell execution to prevent command injection vulnerabilities.
 * 
 * @param {Array<string>} args - Array of git command arguments
 * @param {string} cwd - Target working directory
 * @returns {Promise<string>} Standard output from git command
 */
export async function runGitCommand(args, cwd = process.cwd()) {
  try {
    const { stdout } = await execFileAsync("git", args, {
      cwd,
      maxBuffer: 20 * 1024 * 1024 // 20 MB buffer for large diffs
    });
    return stdout;
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("Git executable not found in system PATH.");
    }
    throw error;
  }
}

/**
 * Checks if a target directory is a Git repository or inside a Git work tree.
 * 
 * @param {string} targetDirectory 
 * @returns {Promise<boolean>}
 */
export async function isGitRepo(targetDirectory) {
  try {
    const output = await runGitCommand(["rev-parse", "--is-inside-work-tree"], targetDirectory);
    return output.trim() === "true";
  } catch {
    return false;
  }
}

/**
 * Extracts structured commit log history from a Git repository.
 * 
 * @param {string} targetDirectory 
 * @param {number} maxCommits 
 * @returns {Promise<Array<Object>>} Array of commit metadata objects
 */
export async function fetchCommitLog(targetDirectory, maxCommits = 100) {
  const format = "%H|%an|%ae|%ad|%s";
  const args = ["log", `-n${maxCommits}`, `--pretty=format:${format}`, "--date=iso"];

  try {
    const rawOutput = await runGitCommand(args, targetDirectory);
    if (!rawOutput || !rawOutput.trim()) return [];

    const lines = rawOutput.trim().split(/\r?\n/);
    return lines.map(line => {
      const [hash, author, email, date, message] = line.split("|");
      return {
        hash,
        author: author || "Unknown",
        email: email || "",
        date: date || "",
        message: message || ""
      };
    });
  } catch (err) {
    return [];
  }
}

/**
 * Retrieves the raw unified patch diff for a specific commit.
 * 
 * @param {string} targetDirectory 
 * @param {string} commitHash 
 * @returns {Promise<string>}
 */
export async function fetchCommitDiff(targetDirectory, commitHash) {
  const args = ["show", "-p", "--unified=0", "--no-color", commitHash];
  return await runGitCommand(args, targetDirectory);
}

/**
 * Reads a file's content as it currently exists at HEAD.
 * Used to verify whether a historical secret is still active or was deleted in subsequent commits.
 * 
 * @param {string} targetDirectory 
 * @param {string} filePath 
 * @returns {Promise<string|null>} File contents at HEAD, or null if deleted/missing
 */
export async function fetchFileAtHead(targetDirectory, filePath) {
  const normalizedPath = filePath.replace(/\\/g, "/");
  try {
    const content = await runGitCommand(["show", `HEAD:${normalizedPath}`], targetDirectory);
    return content;
  } catch {
    return null; // File was deleted or does not exist at HEAD
  }
}