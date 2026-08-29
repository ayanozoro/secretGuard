import path from "path";
import { scanDirectory } from "./scanner/fileScanner.js";

async function main() {
    const targetDir = process.argv[2];
    if (!targetDir) {
        console.error("Please provide a target directory to scan.");
        process.exit(1);
    }

    const resolvedPath = path.resolve(process.cwd(), targetDir);
    console.log(`Scanning directory: ${resolvedPath}\n`);

    const results = await scanDirectory(resolvedPath);
    console.log(`Found ${results.length} valid files:`);
    for (const file of results) {
        console.log(`- ${file.path} (${file.size} bytes)`);
    }
}

main().catch(console.error);
