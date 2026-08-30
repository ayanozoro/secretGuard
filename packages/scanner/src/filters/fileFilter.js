import path from "path";

export const IGNORED_DIRECTORIES = [
  "node_modules",
  ".git",
  ".github",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  ".turbo",
  ".cache",
  "vendor",
  "tmp",
  "temp",
  ".idea",
  ".vscode"
];

export const IGNORED_EXTENSIONS = [
  // Images
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg", ".bmp", ".tiff",
  // Audio/Video
  ".mp3", ".mp4", ".wav", ".avi", ".mov", ".flv", ".mkv",
  // Archives
  ".zip", ".tar", ".gz", ".7z", ".rar", ".bz2",
  // Binaries
  ".exe", ".dll", ".so", ".dylib", ".bin", ".iso",
  // Documents
  ".pdf", ".docx", ".xlsx", ".pptx",
  // Fonts
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  // Lockfiles (usually contain public npm hashes)
  ".lock", "-lock.json"
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Checks if a directory path should be skipped.
 */
export function shouldIgnoreDirectory(dirName) {
  const base = path.basename(dirName);
  return IGNORED_DIRECTORIES.includes(base) || IGNORED_DIRECTORIES.includes(dirName);
}

/**
 * Checks if a file should be skipped based on extension or size.
 */
export function shouldIgnoreFile(filePath, fileSize = 0) {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath).toLowerCase();

  if (IGNORED_EXTENSIONS.includes(ext) || base.endsWith("-lock.json") || base === "package-lock.json") {
    return true;
  }

  if (fileSize > MAX_FILE_SIZE) {
    return true;
  }

  return false;
}
