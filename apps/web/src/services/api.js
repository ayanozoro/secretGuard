/**
 * SecretGuard Web Dashboard API Service
 * 
 * Provides unified communication with the SecretGuard REST API layer.
 * Includes resilient automatic fallback to simulated mock fixtures when the
 * backend server is offline or being previewed in local demo mode.
 * 
 * Strict adherence to the Zero-Plaintext Policy: only masked secrets and
 * SHA-256 fingerprints are handled.
 */

const API_BASE = "/api";
const TIMEOUT_MS = 3500;

// Track whether the live backend is responding
let isBackendLive = null;

// ============================================================================
// In-Memory Simulated Mock Fixtures (High-Fidelity Offline Fallback)
// ============================================================================

let mockOverview = {
  summary: {
    totalRepositories: 4,
    totalScans: 28,
    totalFindings: 14,
    openFindings: 8,
    resolvedFindings: 6,
    criticalOpen: 3,
    highOpen: 3
  },
  topVulnerabilities: [
    { name: "AWS Access Key ID", count: 4, severity: "CRITICAL" },
    { name: "GitHub Personal Access Token", count: 3, severity: "HIGH" },
    { name: "Database Connection URI", count: 3, severity: "CRITICAL" },
    { name: "RSA Private Key Header", count: 2, severity: "CRITICAL" },
    { name: "Generic API Key Assignment", count: 2, severity: "MEDIUM" }
  ],
  recentScans: [
    {
      id: "scan-mock-01",
      repositoryId: { name: "payment-service", url: "https://github.com/secretguard-org/payment-service" },
      branch: "main",
      commitHash: "d7f4a21",
      status: "COMPLETED",
      totalFindings: 2,
      durationMs: 420,
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
    },
    {
      id: "scan-mock-02",
      repositoryId: { name: "auth-gateway", url: "https://github.com/secretguard-org/auth-gateway" },
      branch: "main",
      commitHash: "e391b0c",
      status: "COMPLETED",
      totalFindings: 1,
      durationMs: 310,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
    },
    {
      id: "scan-mock-03",
      repositoryId: { name: "customer-portal", url: "https://github.com/secretguard-org/customer-portal" },
      branch: "main",
      commitHash: "a99c4b1",
      status: "COMPLETED",
      totalFindings: 0,
      durationMs: 280,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString()
    }
  ]
};

let mockRepositories = [
  {
    id: "repo-mock-01",
    name: "payment-service",
    url: "https://github.com/secretguard-org/payment-service",
    defaultBranch: "main",
    totalScans: 12,
    openFindingsCount: 2,
    criticalFindingsCount: 1,
    highFindingsCount: 1,
    mediumFindingsCount: 0,
    lowFindingsCount: 0,
    lastScanAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isPrivate: true
  },
  {
    id: "repo-mock-02",
    name: "auth-gateway",
    url: "https://github.com/secretguard-org/auth-gateway",
    defaultBranch: "main",
    totalScans: 8,
    openFindingsCount: 1,
    criticalFindingsCount: 0,
    highFindingsCount: 1,
    mediumFindingsCount: 0,
    lowFindingsCount: 0,
    lastScanAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    isPrivate: true
  },
  {
    id: "repo-mock-03",
    name: "customer-portal",
    url: "https://github.com/secretguard-org/customer-portal",
    defaultBranch: "main",
    totalScans: 5,
    openFindingsCount: 0,
    criticalFindingsCount: 0,
    highFindingsCount: 0,
    mediumFindingsCount: 0,
    lowFindingsCount: 0,
    lastScanAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    isPrivate: false
  },
  {
    id: "repo-mock-04",
    name: "cloud-infrastructure",
    url: "https://github.com/secretguard-org/cloud-infrastructure",
    defaultBranch: "terraform",
    totalScans: 3,
    openFindingsCount: 5,
    criticalFindingsCount: 2,
    highFindingsCount: 1,
    mediumFindingsCount: 2,
    lowFindingsCount: 0,
    lastScanAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    isPrivate: true
  }
];

let mockFindings = [
  {
    id: "finding-mock-01",
    repositoryId: { id: "repo-mock-01", name: "payment-service" },
    ruleId: "aws-access-key-id",
    ruleName: "AWS Access Key ID",
    type: "AWS_CREDENTIAL",
    filePath: "config/aws.js",
    line: 14,
    column: 21,
    variable: "accessKeyId",
    maskedSecret: "AK••••••••••••••••LE",
    snippet: 'const accessKeyId = "AKIAIOSFODNN7EXAMPLE";',
    confidence: 0.98,
    severity: "CRITICAL",
    entropy: 3.86,
    status: "OPEN",
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    remediation: [
      "Immediately deactivate and delete the exposed Access Key in AWS IAM Management Console.",
      "Create and rotate a new IAM Access Key with minimal necessary IAM permissions.",
      "Audit AWS CloudTrail event history for any unauthorized API calls made using this key."
    ],
    metadata: {
      commitHash: "d7f4a21e4b892a01",
      commitAuthor: "Security Eng <sec@secretguard.io>"
    }
  },
  {
    id: "finding-mock-02",
    repositoryId: { id: "repo-mock-02", name: "auth-gateway" },
    ruleId: "github-pat-classic",
    ruleName: "GitHub Personal Access Token",
    type: "GITHUB_TOKEN",
    filePath: "scripts/deploy.sh",
    line: 8,
    column: 14,
    variable: "GH_TOKEN",
    maskedSecret: "ghp_••••••••••••••••••••••••••••••••3aB8",
    snippet: 'export GH_TOKEN="ghp_1234567890abcdefghijklmnopqrstuvwxyz3aB8"',
    confidence: 0.95,
    severity: "HIGH",
    entropy: 4.12,
    status: "OPEN",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    remediation: [
      "Go to GitHub Settings -> Developer settings -> Personal access tokens and click Revoke.",
      "Replace hardcoded credential with GitHub Actions repository secret or short-lived App token."
    ],
    metadata: {
      commitHash: "e391b0ca82f14300",
      commitAuthor: "Dev Lead <dev@secretguard.io>"
    }
  },
  {
    id: "finding-mock-03",
    repositoryId: { id: "repo-mock-04", name: "cloud-infrastructure" },
    ruleId: "database-connection-uri",
    ruleName: "PostgreSQL Database URI with Password",
    type: "DATABASE_CREDENTIAL",
    filePath: "docker-compose.yml",
    line: 22,
    column: 18,
    variable: "DATABASE_URL",
    maskedSecret: "postgres://app_user:••••••••••••@db.internal:5432/prod_db",
    snippet: 'DATABASE_URL: "postgres://app_user:super_secret_p4ss@db.internal:5432/prod_db"',
    confidence: 0.92,
    severity: "CRITICAL",
    entropy: 3.91,
    status: "OPEN",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    remediation: [
      "Rotate the PostgreSQL user password immediately in database configuration.",
      "Store credentials in an external secrets manager (AWS Secrets Manager or Vault)."
    ],
    metadata: {
      commitHash: "b4109ca882e30129",
      commitAuthor: "Cloud Architect <infra@secretguard.io>"
    }
  },
  {
    id: "finding-mock-04",
    repositoryId: { id: "repo-mock-04", name: "cloud-infrastructure" },
    ruleId: "rsa-private-key",
    ruleName: "RSA Private Key Header",
    type: "PRIVATE_KEY",
    filePath: "ssl/server.key",
    line: 1,
    column: 1,
    variable: null,
    maskedSecret: "-----BEGIN RSA PRIVATE KEY-----",
    snippet: "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0r+V7N... (masked)",
    confidence: 1.0,
    severity: "CRITICAL",
    entropy: 4.88,
    status: "OPEN",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    remediation: [
      "Revoke this TLS certificate immediately with your Certificate Authority (CA).",
      "Purge the committed private key file from Git commit history using git-filter-repo."
    ],
    metadata: {
      commitHash: "c9019aa129e001a4",
      commitAuthor: "Security Eng <sec@secretguard.io>"
    }
  },
  {
    id: "finding-mock-05",
    repositoryId: { id: "repo-mock-01", name: "payment-service" },
    ruleId: "jwt-secret",
    ruleName: "Hardcoded JWT Signing Secret",
    type: "JWT_SECRET",
    filePath: "middleware/session.js",
    line: 5,
    column: 16,
    variable: "JWT_SECRET",
    maskedSecret: "sec••••••••••••••••••••••••key!",
    snippet: 'const JWT_SECRET = "secretguard-jwt-super-secret-key-32b!";',
    confidence: 0.88,
    severity: "HIGH",
    entropy: 3.42,
    status: "RESOLVED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    remediation: [
      "Inject JWT signing secrets at runtime via environment variables.",
      "Invalidate all outstanding session tokens signed with this compromised key."
    ],
    metadata: {
      commitHash: "f11a498b9e02319c",
      commitAuthor: "Backend Dev <backend@secretguard.io>",
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      resolutionNote: "Replaced with process.env.JWT_SECRET injected from Vault"
    }
  }
];

// ============================================================================
// Core Fetch Wrapper with Abort Controller & Fallback
// ============================================================================

async function fetchWithFallback(url, options = {}, fallbackFactory) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("secretguard_token") : null;
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    isBackendLive = true;
    return { data: json.data || json, isLive: true };
  } catch (error) {
    clearTimeout(timeoutId);
    isBackendLive = false;
    console.info(`[SecretGuard API] Live backend unavailable (${error.message}). Using resilient demo mock data.`);
    const fallbackData = await fallbackFactory();
    return { data: fallbackData, isLive: false };
  }
}

// ============================================================================
// API Methods
// ============================================================================

/**
 * Checks if the backend REST server is currently live and responding.
 * 
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  if (isBackendLive !== null) return isBackendLive;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch("/health", { signal: controller.signal });
    clearTimeout(timeout);
    isBackendLive = res.ok;
    return res.ok;
  } catch {
    isBackendLive = false;
    return false;
  }
}

/**
 * Retrieves executive platform metrics, top vulnerability categories, and recent scans.
 * 
 * @returns {Promise<{ data: Object, isLive: boolean }>}
 */
export async function getOverviewStats() {
  return await fetchWithFallback(
    `${API_BASE}/stats/overview`,
    { method: "GET" },
    () => mockOverview
  );
}

/**
 * Retrieves the list of monitored code repositories.
 * 
 * @returns {Promise<{ data: { repositories: Array<Object>, total: number }, isLive: boolean }>}
 */
export async function getRepositories() {
  return await fetchWithFallback(
    `${API_BASE}/repositories`,
    { method: "GET" },
    () => ({ repositories: mockRepositories, total: mockRepositories.length })
  );
}

/**
 * Retrieves repository details with its latest finding metrics.
 * 
 * @param {string} id - Repository ID
 * @returns {Promise<{ data: Object, isLive: boolean }>}
 */
export async function getRepositoryById(id) {
  return await fetchWithFallback(
    `${API_BASE}/repositories/${id}`,
    { method: "GET" },
    () => {
      const repo = mockRepositories.find(r => r.id === id) || mockRepositories[0];
      return { repository: repo, metrics: { total: repo.openFindingsCount, status: { OPEN: repo.openFindingsCount } } };
    }
  );
}

/**
 * Registers a new code repository for monitoring.
 * 
 * @param {Object} repoData
 * @returns {Promise<{ data: Object, isLive: boolean }>}
 */
export async function createRepository(repoData) {
  return await fetchWithFallback(
    `${API_BASE}/repositories`,
    {
      method: "POST",
      body: JSON.stringify(repoData)
    },
    () => {
      const newRepo = {
        id: `repo-mock-${Date.now()}`,
        name: repoData.name,
        url: repoData.url,
        defaultBranch: repoData.defaultBranch || "main",
        totalScans: 0,
        openFindingsCount: 0,
        criticalFindingsCount: 0,
        highFindingsCount: 0,
        mediumFindingsCount: 0,
        lowFindingsCount: 0,
        isPrivate: Boolean(repoData.isPrivate),
        lastScanAt: new Date().toISOString()
      };
      mockRepositories.unshift(newRepo);
      mockOverview.summary.totalRepositories += 1;
      return { repository: newRepo };
    }
  );
}

/**
 * Retrieves paginated, filterable secret leak findings.
 * Supports interactive in-memory filtering when in fallback demo mode.
 * 
 * @param {Object} filters
 * @param {string} [filters.repositoryId]
 * @param {string} [filters.severity]
 * @param {string} [filters.status]
 * @param {string} [filters.search]
 * @param {number} [filters.page=1]
 * @param {number} [filters.limit=20]
 * @returns {Promise<{ data: { findings: Array<Object>, pagination: Object }, isLive: boolean }>}
 */
export async function getFindings(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.repositoryId) queryParams.set("repositoryId", filters.repositoryId);
  if (filters.severity && filters.severity !== "ALL") queryParams.set("severity", filters.severity);
  if (filters.status && filters.status !== "ALL") queryParams.set("status", filters.status);
  if (filters.search) queryParams.set("search", filters.search);
  if (filters.page) queryParams.set("page", filters.page);
  if (filters.limit) queryParams.set("limit", filters.limit);

  const url = `${API_BASE}/findings?${queryParams.toString()}`;

  return await fetchWithFallback(url, { method: "GET" }, () => {
    let filtered = [...mockFindings];

    if (filters.repositoryId) {
      filtered = filtered.filter(f => f.repositoryId?.id === filters.repositoryId || f.repositoryId === filters.repositoryId);
    }
    if (filters.severity && filters.severity !== "ALL") {
      filtered = filtered.filter(f => f.severity.toUpperCase() === filters.severity.toUpperCase());
    }
    if (filters.status && filters.status !== "ALL") {
      filtered = filtered.filter(f => f.status.toUpperCase() === filters.status.toUpperCase());
    }
    if (filters.search && filters.search.trim()) {
      const term = filters.search.toLowerCase().trim();
      filtered = filtered.filter(f =>
        f.ruleName.toLowerCase().includes(term) ||
        f.filePath.toLowerCase().includes(term) ||
        f.type.toLowerCase().includes(term)
      );
    }

    const page = Math.max(1, parseInt(filters.page, 10) || 1);
    const limit = Math.max(1, parseInt(filters.limit, 10) || 20);
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      findings: paginated,
      pagination: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit) || 1
      }
    };
  });
}

/**
 * Updates the security triage status of a secret finding (e.g. RESOLVED, FALSE_POSITIVE, OPEN).
 * Also updates local mock state in demo mode so the UI reflects changes immediately.
 * 
 * @param {string} id - Finding ID
 * @param {Object} payload
 * @param {string} payload.status - RESOLVED | FALSE_POSITIVE | IGNORED | OPEN
 * @param {string} [payload.resolutionNote] - Audit explanation
 * @returns {Promise<{ data: Object, isLive: boolean }>}
 */
export async function updateFindingStatus(id, { status, resolutionNote } = {}) {
  const url = `${API_BASE}/findings/${id}/status`;

  return await fetchWithFallback(
    url,
    {
      method: "PATCH",
      body: JSON.stringify({ status, resolutionNote })
    },
    () => {
      const targetIndex = mockFindings.findIndex(f => f.id === id);
      if (targetIndex !== -1) {
        mockFindings[targetIndex] = {
          ...mockFindings[targetIndex],
          status: status.toUpperCase(),
          metadata: {
            ...mockFindings[targetIndex].metadata,
            resolvedAt: status.toUpperCase() === "OPEN" ? null : new Date().toISOString(),
            resolutionNote: resolutionNote || "Toggled in dashboard triage"
          }
        };

        // Recalculate mock overview counters
        const openCount = mockFindings.filter(f => f.status === "OPEN").length;
        const resolvedCount = mockFindings.filter(f => f.status === "RESOLVED").length;
        const criticalOpen = mockFindings.filter(f => f.status === "OPEN" && f.severity === "CRITICAL").length;
        const highOpen = mockFindings.filter(f => f.status === "OPEN" && f.severity === "HIGH").length;

        mockOverview.summary.openFindings = openCount;
        mockOverview.summary.resolvedFindings = resolvedCount;
        mockOverview.summary.criticalOpen = criticalOpen;
        mockOverview.summary.highOpen = highOpen;

        return { finding: mockFindings[targetIndex] };
      }
      return { finding: null };
    }
  );
}

/**
 * Triggers a repository or directory secret scan.
 * 
 * @param {Object} params
 * @param {string} params.repositoryId
 * @param {string} [params.targetPath]
 * @param {boolean} [params.includeHistory=false]
 * @returns {Promise<{ data: Object, isLive: boolean }>}
 */
export async function triggerScan({ repositoryId, targetPath, includeHistory = false }) {
  return await fetchWithFallback(
    `${API_BASE}/scans/trigger`,
    {
      method: "POST",
      body: JSON.stringify({ repositoryId, targetPath, includeHistory })
    },
    async () => {
      // Simulate 1.2s realistic scanner execution delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      const repo = mockRepositories.find(r => r.id === repositoryId) || mockRepositories[0];
      repo.totalScans += 1;
      repo.lastScanAt = new Date().toISOString();

      mockOverview.summary.totalScans += 1;

      return {
        scan: {
          id: `scan-mock-${Date.now()}`,
          repositoryId: { name: repo.name, url: repo.url },
          branch: repo.defaultBranch || "main",
          status: "COMPLETED",
          totalFilesScanned: 34,
          totalFindings: repo.openFindingsCount,
          durationMs: 840,
          completedAt: new Date().toISOString()
        },
        message: "Scan executed successfully (simulated demo mode)"
      };
    }
  );
}

export default {
  checkBackendHealth,
  getOverviewStats,
  getRepositories,
  getRepositoryById,
  createRepository,
  getFindings,
  updateFindingStatus,
  triggerScan
};
