import path from "path";

/**
 * Parses raw process.argv arguments into a structured CLI options object.
 * 
 * Supports:
 *   secretguard scan [targetPath]
 *   --history (scan git commit history)
 *   --json (machine-readable output)
 *   --severity <level> (critical, high, medium, low)
 *   --max-depth <n> (max git commits to inspect)
 *   --exit-zero (never exit with error code, useful for audit-only mode)
 *   --help / -h
 *   --version / -v
 * 
 * @param {Array<string>} argv 
 * @returns {Object} { command, targetPath, includeHistory, json, minSeverity, maxCommits, exitZero, isHelp, isVersion }
 */
export function parseArguments(argv = process.argv.slice(2)) {
  const options = {
    command: "scan",
    targetPath: ".",
    includeHistory: false,
    json: false,
    minSeverity: "LOW",
    maxCommits: 100,
    exitZero: false,
    isHelp: false,
    isVersion: false
  };

  const positionalArgs = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      options.isHelp = true;
    } else if (arg === "--version" || arg === "-v") {
      options.isVersion = true;
    } else if (arg === "--history" || arg === "-H") {
      options.includeHistory = true;
    } else if (arg === "--json" || arg === "-j") {
      options.json = true;
    } else if (arg === "--exit-zero") {
      options.exitZero = true;
    } else if (arg === "--severity" || arg === "-s") {
      const next = argv[++i];
      if (next) options.minSeverity = next.toUpperCase();
    } else if (arg === "--max-depth" || arg === "--depth" || arg === "-d") {
      const next = argv[++i];
      if (next && !isNaN(parseInt(next, 10))) {
        options.maxCommits = parseInt(next, 10);
      }
    } else if (!arg.startsWith("-")) {
      positionalArgs.push(arg);
    }
  }

  if (positionalArgs.length > 0) {
    if (["scan", "history", "version", "help"].includes(positionalArgs[0].toLowerCase())) {
      options.command = positionalArgs[0].toLowerCase();
      if (positionalArgs[1]) {
        options.targetPath = positionalArgs[1];
      }
    } else {
      options.targetPath = positionalArgs[0];
    }
  }

  options.targetPath = path.resolve(process.cwd(), options.targetPath);
  return options;
}
