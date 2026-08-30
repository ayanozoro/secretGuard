/**
 * Synthetic test fixtures for SecretGuard verification.
 * ZERO REAL CREDENTIALS are used.
 */
export const SYNTHETIC_FIXTURES = {
  aws: {
    valid: 'const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";\nconst AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";',
    placeholder: 'const AWS_ACCESS_KEY_ID = "YOUR_ACCESS_KEY";'
  },
  github: {
    classic: 'const GITHUB_TOKEN = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";',
    fineGrained: 'const PAT = "github_pat_11ABCD1234567890_mockPATstringWithHighEntropyCharacterDistribution9876543210ABCDEF";',
    placeholder: 'const GITHUB_TOKEN = "YOUR_TOKEN_HERE";'
  },
  database: {
    postgres: 'const DB_URL = "postgres://dbadmin:p@ssw0rd123StrongSecret!@db.internal:5432/production";',
    placeholder: 'const DB_URL = "postgres://user:password@localhost:5432/test";'
  },
  jwt: {
    valid: 'const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";',
    invalid: 'const dummy = "eyJabc.invalid.jwt";'
  },
  privateKey: {
    rsa: '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0Y3...\n-----END RSA PRIVATE KEY-----'
  },
  generic: {
    apiKey: 'const API_KEY = "secret_live_9876543210_abcdef123456";',
    placeholder: 'const API_KEY = "YOUR_API_KEY";'
  }
};
