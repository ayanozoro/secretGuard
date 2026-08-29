import fs from "fs/promises";
import path from "path";
import { ShouldIgnoreDiretory, ShouldIgnoreFile } from "./fileFilter.js";

export async function scanDirectory(directory) {
    const res = [];
    let entries;

    try {
        entries = await fs.readdir(directory, {
            withFileTypes: true
        });
    } catch (e) {
        console.error(`Failed to read directory ${directory}:`, e);
        return [];
    }

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            if (ShouldIgnoreDiretory(entry.name)) {
                continue;
            }
            const subEntries = await scanDirectory(fullPath);
            res.push(...subEntries);
            continue;
        }

        if (entry.isFile()) {
            let stats;
            try {
                stats = await fs.stat(fullPath);
            } catch (error) {
                console.error(`Failed to stat file ${fullPath}:`, error);
                continue;
            }
            const fileSize = stats.size;

            if (ShouldIgnoreFile(fullPath, fileSize)) {
                continue;
            }

            let content;
            try {
                content = await fs.readFile(fullPath, "utf-8");
            } catch (e) {
                console.error(`Failed to read file ${fullPath}:`, e);
                continue;
            }

            res.push({
                path: fullPath,
                name: entry.name,
                extension: path.extname(entry.name),
                size: fileSize,
                content: content
            });
        }
    }

    return res;
}
