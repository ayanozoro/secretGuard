import path from "path";
import {
    ignoredDirectories,
    ignoredExtensions,
    MAX_FILE_SIZE
} from "./config.js";

export function ShouldIgnoreDiretory(dir) {
    const dirName = path.basename(dir);
    return ignoredDirectories.includes(dirName) || ignoredDirectories.includes(dir);
}

export function ShouldIgnoreFile(filePath, fileSize) {
    const ext = path.extname(filePath).toLowerCase();

    if (ignoredExtensions.includes(ext)) {
        return true;
    }

    if (fileSize > MAX_FILE_SIZE) {
        return true;
    }

    return false;
}
