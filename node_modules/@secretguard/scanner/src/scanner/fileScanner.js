import fs from "fs/promises";
import path from "path";
import { shouldIgnoreDirectory, shouldIgnoreFile } from "../filters/fileFilter.js";

/**
 * Recursively scans a directory and collects all valid, readable source files.
 * Handles permission errors gracefully without crashing the scan.
 * 
 * @param {string} targetDir - Absolute or relative directory path
 * @param {Object} options - Scan configuration options
 * @returns {Promise<Array<Object>>} Array of file descriptors { path, name, extension, size, content, lines }
 */
export async function scanDirectory(targetDir, options = {}) {
  const resolvedDir = path.resolve(process.cwd(), targetDir);
  const files = [];

  async function traverse(currentPath) {
    let entries;
    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch (err) {
      // Permission error or missing directory - continue traversal
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (shouldIgnoreDirectory(entry.name)) {
          continue;
        }
        await traverse(fullPath);
        continue;
      }

      if (entry.isFile()) {
        let stats;
        try {
          stats = await fs.stat(fullPath);
        } catch {
          continue;
        }

        if (shouldIgnoreFile(fullPath, stats.size)) {
          continue;
        }

        let content;
        try {
          content = await fs.readFile(fullPath, "utf-8");
        } catch {
          // Unreadable file or binary content
          continue;
        }

        files.push({
          path: fullPath,
          relativePath: path.relative(resolvedDir, fullPath).replace(/\\/g, "/"),
          name: entry.name,
          extension: path.extname(entry.name),
          size: stats.size,
          content,
          lines: content.split(/\r?\n/)
        });
      }
    }
  }

  await traverse(resolvedDir);
  return files;
}
