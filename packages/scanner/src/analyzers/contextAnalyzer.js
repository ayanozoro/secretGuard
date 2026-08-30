import path from "path";

const HIGH_SENSITIVITY_FILES = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.staging",
  ".env.development",
  "credentials.json",
  "secrets.yml",
  "secrets.yaml",
  "config.json",
  "id_rsa",
  "id_ecdsa",
  "id_ed25519",
  "private.key"
];

const LOW_SENSITIVITY_FILES = [
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "example.env",
  ".env.example",
  "sample.config.js"
];

const SENSITIVE_VAR_NAMES = [
  "API_KEY", "APIKEY", "SECRET_KEY", "SECRET", "PASSWORD", "PASSWD", "AUTH_TOKEN",
  "ACCESS_TOKEN", "PRIVATE_KEY", "CLIENT_SECRET", "DB_PASSWORD", "DATABASE_URL",
  "AWS_SECRET_ACCESS_KEY", "GITHUB_TOKEN", "SLACK_TOKEN", "STRIPE_SECRET_KEY"
];

/**
 * Evaluates context around a candidate secret to assess likelihood of a real leak.
 * 
 * @param {Object} params
 * @param {string} params.filePath - File path
 * @param {string} params.lineText - Full text of the line
 * @param {string} params.variable - Identified variable name
 * @param {Array<string>} params.surroundingLines - Nearby lines of code
 * @returns {Object} Context evaluation with score (-1.0 to +1.0) and signals
 */
export function analyzeContext({ filePath = "", lineText = "", variable = "", surroundingLines = [] }) {
  let score = 0.0;
  const signals = [];
  const fileName = path.basename(filePath).toLowerCase();

  // File Sensitivity Check
  if (HIGH_SENSITIVITY_FILES.some(f => fileName === f.toLowerCase() || fileName.startsWith(".env"))) {
    score += 0.35;
    signals.push("high_sensitivity_file");
  } else if (LOW_SENSITIVITY_FILES.some(f => fileName === f.toLowerCase() || fileName.includes("example") || fileName.includes("mock"))) {
    score -= 0.30;
    signals.push("documentation_or_example_file");
  }

  // Test File Check
  if (filePath.includes("test") || filePath.includes("spec") || filePath.includes("__tests__")) {
    score -= 0.20;
    signals.push("test_file_context");
  }

  // Variable Name Check
  if (variable) {
    const varUpper = variable.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (SENSITIVE_VAR_NAMES.some(s => varUpper.includes(s.replace(/_/g, "")))) {
      score += 0.35;
      signals.push("sensitive_variable_name");
    }
  }

  // Assignment Context in Line
  if (/[:=]\s*["'`][^"'`]+["'`]/.test(lineText)) {
    score += 0.15;
    signals.push("explicit_string_assignment");
  }

  // Check if variable is used in export/dotenv pattern
  if (/process\.env|dotenv|config|export\s+const/i.test(lineText)) {
    score += 0.15;
    signals.push("config_or_env_pattern");
  }

  return {
    score: Math.min(Math.max(score, -1.0), 1.0),
    signals,
    isSensitiveFile: signals.includes("high_sensitivity_file"),
    isTestFile: signals.includes("test_file_context")
  };
}
