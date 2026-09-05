import { logger } from "../../../../packages/shared/src/utils/logger.js";
import { Severity } from "../../../../packages/shared/src/constants/enums.js";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgYellow: "\x1b[43m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m"
};

function getSeverityBadge(severity) {
  switch (severity) {
    case Severity.CRITICAL:
      return `${colors.bgRed}${colors.white}${colors.bright} CRITICAL ${colors.reset}`;
    case Severity.HIGH:
      return `${colors.red}${colors.bright}[HIGH]${colors.reset}`;
    case Severity.MEDIUM:
      return `${colors.yellow}${colors.bright}[MEDIUM]${colors.reset}`;
    case Severity.LOW:
      return `${colors.cyan}[LOW]${colors.reset}`;
    default:
      return `[${severity}]`;
  }
}

export function formatTerminalReport(scanResult) {
  logger.banner();

  console.log(`${colors.bright}Scan Summary:${colors.reset}`);
  console.log(`  Target Directory : ${colors.cyan}${scanResult.target}${colors.reset}`);
  console.log(`  Files Evaluated  : ${scanResult.totalFilesScanned}`);
  if (scanResult.isGit && scanResult.includeHistory) {
    console.log(`  Commits Inspected: ${scanResult.totalCommitsScanned}`);
  }
  console.log(`  Scan Duration    : ${scanResult.durationMs}ms`);
  console.log(`  Findings Found   : ${scanResult.totalFindings > 0 ? colors.red + scanResult.totalFindings : colors.green + "0"} ${colors.reset}\n`);

  console.log(`${colors.bright}Severity Breakdown:${colors.reset}`);
  console.log(`  Critical : ${scanResult.severityCounts.CRITICAL > 0 ? colors.red + colors.bright + scanResult.severityCounts.CRITICAL + colors.reset : "0"}`);
  console.log(`  High     : ${scanResult.severityCounts.HIGH > 0 ? colors.red + scanResult.severityCounts.HIGH + colors.reset : "0"}`);
  console.log(`  Medium   : ${scanResult.severityCounts.MEDIUM > 0 ? colors.yellow + scanResult.severityCounts.MEDIUM + colors.reset : "0"}`);
  console.log(`  Low      : ${scanResult.severityCounts.LOW}\n`);

  if (scanResult.findings.length === 0) {
    console.log(`${colors.green}${colors.bright}✓ No exposed secrets detected. Repository is clean!${colors.reset}\n`);
    return;
  }

  console.log(`${colors.bright}======================== DETECTED FINDINGS ========================${colors.reset}\n`);

  scanResult.findings.forEach((finding, idx) => {
    const badge = getSeverityBadge(finding.severity);
    console.log(`${badge} ${colors.bright}${finding.ruleName}${colors.reset} (Confidence: ${(finding.confidence * 100).toFixed(0)}%, Entropy: ${finding.entropy})`);
    console.log(`  ${colors.dim}File:${colors.reset} ${colors.cyan}${finding.filePath}:${finding.line}${colors.reset}`);
    
    if (finding.metadata?.commitHash) {
      const danglingTag = finding.metadata.isDeletedInHead ? ` ${colors.bgYellow}${colors.white} GHOST / DELETED SECRET ${colors.reset}` : "";
      console.log(`  ${colors.dim}Commit:${colors.reset} ${finding.metadata.shortHash || finding.metadata.commitHash.slice(0, 7)} by ${finding.metadata.commitAuthor} (${finding.metadata.commitDate})${danglingTag}`);
      if (finding.metadata.commitMessage) {
        console.log(`  ${colors.dim}Message:${colors.reset} "${finding.metadata.commitMessage}"`);
      }
    }

    console.log(`  ${colors.dim}Masked Secret:${colors.reset} ${colors.yellow}${finding.maskedSecret}${colors.reset}`);
    console.log(`  ${colors.dim}Matched Snippet:${colors.reset} ${finding.snippet}`);

    if (finding.remediation && finding.remediation.length > 0) {
      console.log(`  ${colors.dim}Remediation:${colors.reset}`);
      finding.remediation.forEach(step => {
        console.log(`    ${colors.cyan}→${colors.reset} ${step}`);
      });
    }

    console.log(colors.dim + "------------------------------------------------------------------" + colors.reset + "\n");
  });
}
