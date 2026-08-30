import { Severity, DetectorType } from "../../../packages/shared/src/constants/enums.js";

/**
 * Central catalog of detector rules with severity, regex patterns, and validation requirements.
 */
export const RULES = [
  // AWS Rules
  {
    id: "aws-access-key-id",
    name: "AWS Access Key ID",
    type: DetectorType.AWS_CREDENTIAL,
    severity: Severity.CRITICAL,
    regex: /\b((?:AKIA|ASIA|ABIA|ACCA)[0-9A-Z]{16})\b/g,
    captureGroup: 1,
    minEntropy: 3.0,
    remediation: [
      "1. Open AWS IAM Management Console.",
      "2. Deactivate and delete the exposed Access Key ID immediately.",
      "3. Inspect CloudTrail logs for unusual API calls originating from the key.",
      "4. Provision IAM Roles or AWS Secrets Manager instead of static credentials."
    ]
  },
  {
    id: "aws-secret-access-key",
    name: "AWS Secret Access Key",
    type: DetectorType.AWS_CREDENTIAL,
    severity: Severity.CRITICAL,
    regex: /(?:aws_secret_access_key|aws_secret_key|secret_access_key)[\s:='\"]*([A-Za-z0-9\/+=]{40})/gi,
    captureGroup: 1,
    minEntropy: 4.2,
    remediation: [
      "1. Rotate AWS Access Key pair in AWS IAM Console immediately.",
      "2. Check CloudTrail for compromised actions.",
      "3. Use AWS IAM Roles for EC2/ECS/Lambda instead of static credentials."
    ]
  },

  // GitHub Rules
  {
    id: "github-pat-classic",
    name: "GitHub Personal Access Token (Classic)",
    type: DetectorType.GITHUB_TOKEN,
    severity: Severity.HIGH,
    regex: /\b(ghp_[a-zA-Z0-9]{36})\b/g,
    captureGroup: 1,
    minEntropy: 3.8,
    remediation: [
      "1. Revoke the token at https://github.com/settings/tokens.",
      "2. Audit recent repository and organization audit logs.",
      "3. Generate a Fine-Grained Personal Access Token with minimal permissions."
    ]
  },
  {
    id: "github-pat-fine-grained",
    name: "GitHub Fine-Grained Personal Access Token",
    type: DetectorType.GITHUB_TOKEN,
    severity: Severity.HIGH,
    regex: /\b(github_pat_[a-zA-Z0-9_]{82})\b/g,
    captureGroup: 1,
    minEntropy: 4.0,
    remediation: [
      "1. Revoke the token under GitHub Settings -> Developer settings.",
      "2. Review token permissions and scope before issuing a replacement."
    ]
  },
  {
    id: "github-oauth-token",
    name: "GitHub OAuth Access Token",
    type: DetectorType.GITHUB_TOKEN,
    severity: Severity.HIGH,
    regex: /\b(gho_[a-zA-Z0-9]{36})\b/g,
    captureGroup: 1,
    minEntropy: 3.8
  },

  // Private Keys
  {
    id: "private-key-pem",
    name: "Private Key (PEM/OpenSSH/RSA/EC/PGP)",
    type: DetectorType.PRIVATE_KEY,
    severity: Severity.CRITICAL,
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----/g,
    remediation: [
      "1. Treat this private key as completely compromised.",
      "2. Remove public key counterpart from authorized_keys / server configurations.",
      "3. Generate a new keypair and redistribute public key securely.",
      "4. Check server SSH authentication logs for unauthorized access."
    ]
  },

  // JWT Tokens
  {
    id: "jwt-token",
    name: "JSON Web Token (JWT)",
    type: DetectorType.JWT_SECRET,
    severity: Severity.MEDIUM,
    regex: /\b(eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+)\b/g,
    captureGroup: 1,
    minEntropy: 4.0,
    remediation: [
      "1. Invalidate active sessions or rotate token signing secret if hardcoded.",
      "2. Use short token expiration times and secure HttpOnly cookie transport."
    ]
  },

  // Database Connection Strings
  {
    id: "database-uri-credentials",
    name: "Database Connection String with Credentials",
    type: DetectorType.DATABASE_CREDENTIAL,
    severity: Severity.HIGH,
    regex: /(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|mariadb|amqp):\/\/[^:\s]+:([^@\s]+)@[^\s\/]+/gi,
    captureGroup: 1,
    minEntropy: 2.5,
    remediation: [
      "1. Change database user password immediately.",
      "2. Isolate database behind VPC / private subnet.",
      "3. Use dynamic credentials or managed secret injection."
    ]
  },

  // Generic Credentials
  {
    id: "generic-api-key",
    name: "Generic API Key / Secret Assignment",
    type: DetectorType.GENERIC_SECRET,
    severity: Severity.HIGH,
    regex: /\b(?:api_?key|secret_?key|access_?token|auth_?token|client_?secret|private_?key|app_?secret)\b\s*[:=]\s*["']?([a-zA-Z0-9_\-\.]{14,})["']?/gi,
    captureGroup: 1,
    minEntropy: 3.2
  },
  {
    id: "generic-password",
    name: "Hardcoded Password",
    type: DetectorType.GENERIC_SECRET,
    severity: Severity.HIGH,
    regex: /\b(?:password|passwd|db_pass|database_password|secret_word)\b\s*[:=]\s*["']?([^'"\s;,\n]{8,})["']?/gi,
    captureGroup: 1,
    minEntropy: 2.8
  },
  {
    id: "generic-bearer-token",
    name: "Bearer Token Authorization Header",
    type: DetectorType.GENERIC_SECRET,
    severity: Severity.HIGH,
    regex: /Bearer\s+([a-zA-Z0-9_\-\.=]{20,})/gi,
    captureGroup: 1,
    minEntropy: 3.5
  }
];
