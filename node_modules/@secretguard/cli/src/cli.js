import { parseArguments } from "./options.js";
import { formatTerminalReport } from "./formatters/terminalFormatter.js";
import { formatJsonReport } from "./formatters/jsonFormatter.js";
import { ScanManager } from "../../../packages/scanner/src/scanner/scanManager.js";
import { scanGitRepository } from "../../../packages/scanner/src/git/gitScanner.js";
import { isGitRepo } from "../../../packages/scanner/src/git/gitUtils.js";
import { Severity } from "../../../packages/shared/src/constants/enums.js";

const SEVERITY_LEVELS = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  INFO: 0
};

export function showHelp() {
  console.log(`
SecretGuard CLI - Secret Leak Intelligence & Prevention Platform

USAGE:
  secretguard scan [path] [options]

COMMANDS:
  scan [path]         Scan files in the specified directory (defaults to current directory)
  help, --help, -h    Display this help message
  version, -v         Display CLI version

OPTIONS:
  --history, -H       Inspect full Git commit history for past & deleted secrets
  --json, -j          Output scan results as structured JSON (for CI/CD pipelines)
  --severity, -s      Minimum severity failure threshold: critical | high | medium | low (default: low)
  --max-depth, -d     Maximum commit depth for Git history scanning (default: 100)
  --exit-zero         Always exit with code 0 (audit mode)

EXAMPLES:
  secretguard scan .
  secretguard scan ./src --severity high
  secretguard scan --history .
  secretguard scan --json . > report.json
`);
}

export async function runCli(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);

  if (options.isHelp || options.command === "help") {
    showHelp();
    return 0;
  }

  if (options.isVersion || options.command === "version") {
    console.log("SecretGuard CLI v1.0.0");
    return 0;
  }

  const isGit = await isGitRepo(options.targetPath);
  let scanResult;

  if (options.includeHistory && isGit) {
    scanResult = await scanGitRepository(options.targetPath, {
      includeHistory: true,
      maxCommits: options.maxCommits
    });
  } else {
    const scanner = new ScanManager();
    scanResult = await scanner.scan(options.targetPath);
    scanResult.isGit = isGit;
    scanResult.includeHistory = false;
  }

  // Filter findings based on minimum severity threshold
  const minThresholdRank = SEVERITY_LEVELS[options.minSeverity] || 0;
  const filteredFindings = scanResult.findings.filter(f => {
    const rank = SEVERITY_LEVELS[f.severity] || 0;
    return rank >= minThresholdRank;
  });

  scanResult.findings = filteredFindings;
  scanResult.totalFindings = filteredFindings.length;

  if (options.json) {
    console.log(formatJsonReport(scanResult));
  } else {
    formatTerminalReport(scanResult);
  }

  // Determine CI exit code
  if (options.exitZero) {
    return 0;
  }

  const blockingFindings = filteredFindings.filter(f => {
    return f.severity === Severity.CRITICAL || f.severity === Severity.HIGH;
  });

  return blockingFindings.length > 0 ? 1 : 0;
}
