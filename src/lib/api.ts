import type {
  Repository,
  Examination,
  HealthRecord,
  Diagnosis,
  Treatment,
} from "./types";

// Mock data for development
export const MOCK_REPO: Repository = {
  id: "repo-1",
  name: "my-project",
  fullName: "acme/my-project",
  url: "https://github.com/acme/my-project",
  branch: "main",
  defaultBranch: "main",
  description: "A sample web application for demonstration",
  language: "TypeScript",
  size: 2400000,
  technologies: [
    { name: "TypeScript", version: "5.4.0", confidence: 0.98 },
    { name: "React", version: "18.3.0", confidence: 0.95 },
    { name: "Next.js", version: "14.2.0", confidence: 0.92 },
    { name: "Tailwind CSS", version: "3.4.0", confidence: 0.88 },
    { name: "Node.js", version: "20.0.0", confidence: 0.85 },
  ],
  createdAt: "2025-12-01T00:00:00Z",
  lastExaminedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

const MOCK_EXAMINATION: Examination = {
  id: "exam-1",
  repositoryId: "repo-1",
  status: "completed",
  progress: 100,
  currentStage: "completed",
  stages: [
    { name: "Validating source", status: "completed", startedAt: "2025-01-01T00:00:00Z", completedAt: "2025-01-01T00:00:01Z" },
    { name: "Extracting files", status: "completed", startedAt: "2025-01-01T00:00:01Z", completedAt: "2025-01-01T00:00:03Z" },
    { name: "Mapping project structure", status: "completed", startedAt: "2025-01-01T00:00:03Z", completedAt: "2025-01-01T00:00:05Z" },
    { name: "Detecting technologies", status: "completed", startedAt: "2025-01-01T00:00:05Z", completedAt: "2025-01-01T00:00:07Z" },
    { name: "Inspecting imports", status: "completed", startedAt: "2025-01-01T00:00:07Z", completedAt: "2025-01-01T00:00:10Z" },
    { name: "Reviewing dependencies", status: "completed", startedAt: "2025-01-01T00:00:10Z", completedAt: "2025-01-01T00:00:14Z" },
    { name: "Examining tests", status: "completed", startedAt: "2025-01-01T00:00:14Z", completedAt: "2025-01-01T00:00:18Z" },
    { name: "Reviewing documentation", status: "completed", startedAt: "2025-01-01T00:00:18Z", completedAt: "2025-01-01T00:00:20Z" },
    { name: "Generating diagnoses", status: "completed", startedAt: "2025-01-01T00:00:20Z", completedAt: "2025-01-01T00:00:25Z" },
    { name: "Calculating health score", status: "completed", startedAt: "2025-01-01T00:00:25Z", completedAt: "2025-01-01T00:00:27Z" },
  ],
  startedAt: "2025-01-01T00:00:00Z",
  completedAt: "2025-01-01T00:00:27Z",
  error: null,
};

export const MOCK_HEALTH: HealthRecord = {
  id: "health-1",
  repositoryId: "repo-1",
  examinationId: "exam-1",
  score: 68,
  grade: "needs_attention",
  previousScore: 72,
  scoreChange: -4,
  dimensions: [
    { name: "Security", score: 45, weight: 0.25, findings: 3, summary: "Exposed credential and weak dependency" },
    { name: "Reliability", score: 72, weight: 0.2, findings: 2, summary: "Missing error boundaries" },
    { name: "Maintainability", score: 78, weight: 0.2, findings: 4, summary: "Several undocumented components" },
    { name: "Testing", score: 55, weight: 0.15, findings: 2, summary: "Low test coverage on critical paths" },
    { name: "Documentation", score: 60, weight: 0.1, findings: 3, summary: "Missing README sections" },
    { name: "Dependencies", score: 82, weight: 0.1, findings: 1, summary: "One outdated dependency" },
  ],
  summary: "The score is mainly affected by one exposed credential, weak test coverage signals, and four undocumented environment variables.",
  examinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

export const MOCK_DIAGNOSES: Diagnosis[] = [
  {
    id: "diag-1",
    repositoryId: "repo-1",
    healthRecordId: "health-1",
    title: "Exposed GitHub Token in Configuration",
    summary: "A valid GitHub personal access token is stored in plain text in config.json",
    description: "A valid GitHub personal access token is stored in plain text in config.json, exposing repository access to anyone with the source code. This is a critical security issue that could lead to unauthorized access, data leakage, or supply chain attacks if the repository is public or shared.",
    severity: "critical",
    confidence: 0.95,
    category: "security",
    affectedFiles: [
      { path: "config.json", lines: [[12, 12]], relevance: "Contains the exposed token" },
      { path: ".env.example", lines: [[5, 5]], relevance: "References the token variable" },
    ],
    evidence: [
      {
        type: "config",
        description: "GitHub token found in plain text configuration",
        filePath: "config.json",
        lines: [[12, 12]],
        snippet: '"github_token": "ghp_xxxxxxxxxxxxxxxxxxxx"',
      },
    ],
    repairable: true,
    repairRisk: "low",
    repairEffort: "quick",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "diag-2",
    repositoryId: "repo-1",
    healthRecordId: "health-1",
    title: "Missing Error Boundary Components",
    summary: "React components lack error boundaries for graceful failure handling",
    description: "Several React component trees do not have error boundaries. If a rendering error occurs, it will crash the entire application instead of showing a fallback UI. This affects the main dashboard, settings page, and diagnosis detail view.",
    severity: "high",
    confidence: 0.88,
    category: "reliability",
    affectedFiles: [
      { path: "src/app/page.tsx", lines: [[1, 50]], relevance: "Main page without error boundary" },
      { path: "src/app/settings/page.tsx", lines: [[1, 30]], relevance: "Settings page without error boundary" },
    ],
    evidence: [
      {
        type: "pattern",
        description: "No ErrorBoundary components found in component tree",
        filePath: "src/app/layout.tsx",
        lines: null,
        snippet: null,
      },
    ],
    repairable: true,
    repairRisk: "low",
    repairEffort: "moderate",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "diag-3",
    repositoryId: "repo-1",
    healthRecordId: "health-1",
    title: "Low Test Coverage on Authentication Module",
    summary: "The authentication module has only 23% test coverage",
    description: "The authentication module (src/lib/auth.ts) handles user login, token validation, and session management but has minimal test coverage. Critical paths like token refresh and session expiry are untested.",
    severity: "high",
    confidence: 0.92,
    category: "testing",
    affectedFiles: [
      { path: "src/lib/auth.ts", lines: [[1, 120]], relevance: "Core auth logic with low coverage" },
      { path: "src/lib/auth.test.ts", lines: [[1, 15]], relevance: "Minimal test file" },
    ],
    evidence: [
      {
        type: "code",
        description: "Test file contains only basic smoke tests",
        filePath: "src/lib/auth.test.ts",
        lines: [[1, 15]],
        snippet: 'describe("auth", () => {\n  it("exports functions", () => {\n    expect(auth).toBeDefined();\n  });\n});',
      },
    ],
    repairable: false,
    repairRisk: "high",
    repairEffort: "significant",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "diag-4",
    repositoryId: "repo-1",
    healthRecordId: "health-1",
    title: "Undocumented Environment Variables",
    summary: "4 environment variables are used but not documented",
    description: "The application references DATABASE_URL, API_SECRET, CACHE_TTL, and RATE_LIMIT through process.env but these are not documented in any README or .env.example file. New developers will not know what configuration is required.",
    severity: "medium",
    confidence: 0.85,
    category: "documentation",
    affectedFiles: [
      { path: "src/lib/db.ts", lines: [[3, 3]], relevance: "Uses DATABASE_URL" },
      { path: "src/lib/cache.ts", lines: [[5, 5]], relevance: "Uses CACHE_TTL" },
    ],
    evidence: [
      {
        type: "config",
        description: "Environment variables referenced without documentation",
        filePath: "src/lib/db.ts",
        lines: [[3, 3]],
        snippet: 'const db = new Database(process.env.DATABASE_URL);',
      },
    ],
    repairable: true,
    repairRisk: "low",
    repairEffort: "quick",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "diag-5",
    repositoryId: "repo-1",
    healthRecordId: "health-1",
    title: "Outdated lodash Dependency",
    summary: "lodash@4.17.20 has known prototype pollution vulnerabilities",
    description: "The project depends on lodash@4.17.20 which has known security vulnerabilities (CVE-2021-23337). Upgrading to 4.17.21 or later resolves this issue.",
    severity: "medium",
    confidence: 0.98,
    category: "dependencies",
    affectedFiles: [
      { path: "package.json", lines: [[15, 15]], relevance: "lodash dependency declaration" },
    ],
    evidence: [
      {
        type: "dependency",
        description: "Known CVE in lodash < 4.17.21",
        filePath: "package.json",
        lines: [[15, 15]],
        snippet: '"lodash": "4.17.20"',
      },
    ],
    repairable: true,
    repairRisk: "low",
    repairEffort: "quick",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_TREATMENTS: Treatment[] = [
  {
    id: "treat-1",
    repositoryId: "repo-1",
    diagnosisId: "diag-4",
    status: "completed",
    proposal: {
      summary: "Add environment variable documentation to .env.example and README",
      risk: "low",
      affectedFiles: [".env.example", "README.md"],
      assumptions: ["All listed variables are required for production"],
      verificationPlan: ["Lint check", "Validate .env.example format"],
    },
    patches: [
      {
        path: ".env.example",
        operation: "modify",
        additions: 6,
        deletions: 1,
        diff: '--- a/.env.example\n+++ b/.env.example\n@@ -1 +1,6 @@\n-# Environment variables\n+# Required environment variables\n+DATABASE_URL=postgresql://localhost:5432/mydb\n+API_SECRET=your-secret-here\n+CACHE_TTL=3600\n+RATE_LIMIT=100\n+# Optional\n+LOG_LEVEL=info',
        explanation: "Added all undocumented environment variables with placeholder values",
      },
    ],
    verification: {
      steps: [
        { name: "Linting", command: "eslint .env.example", status: "passed", output: null, duration: 1200 },
        { name: "Format check", command: "prettier --check .env.example", status: "passed", output: null, duration: 800 },
      ],
      overallStatus: "passed",
    },
    scoreBefore: 68,
    scoreAfter: 71,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },
];

// API functions (currently return mock data)
export async function getRepositories(): Promise<Repository[]> {
  return [MOCK_REPO];
}

export async function getRepository(id: string): Promise<Repository> {
  return { ...MOCK_REPO, id };
}

export async function connectRepository(url: string): Promise<Repository> {
  const response = await fetch("/api/repositories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
  const payload = await response.json() as Repository | { message?: string };
  if (!response.ok) throw new Error("message" in payload ? payload.message : "Could not connect repository.");
  return payload as Repository;
}

export async function getExamination(repoId: string): Promise<Examination> {
  return MOCK_EXAMINATION;
}

export async function startExamination(repoId: string): Promise<Examination> {
  return { ...MOCK_EXAMINATION, status: "queued", progress: 0 };
}

export async function getHealthRecord(repoId: string): Promise<HealthRecord> {
  return MOCK_HEALTH;
}

export async function getDiagnoses(repoId: string): Promise<Diagnosis[]> {
  return MOCK_DIAGNOSES;
}

export async function getDiagnosis(
  repoId: string,
  diagnosisId: string
): Promise<Diagnosis | undefined> {
  return MOCK_DIAGNOSES.find((d) => d.id === diagnosisId);
}

export async function updateDiagnosisStatus(
  repoId: string,
  diagnosisId: string,
  status: "open" | "resolved" | "dismissed"
): Promise<Diagnosis | undefined> {
  const diag = MOCK_DIAGNOSES.find((d) => d.id === diagnosisId);
  if (diag) diag.status = status;
  return diag;
}

export async function getTreatments(repoId: string): Promise<Treatment[]> {
  return MOCK_TREATMENTS;
}

export async function getTreatment(
  repoId: string,
  treatmentId: string
): Promise<Treatment | undefined> {
  return MOCK_TREATMENTS.find((t) => t.id === treatmentId);
}

export async function createTreatment(
  repoId: string,
  diagnosisId: string
): Promise<Treatment> {
  return MOCK_TREATMENTS[0];
}

export async function approveTreatment(
  repoId: string,
  treatmentId: string
): Promise<Treatment> {
  return MOCK_TREATMENTS[0];
}

export async function rollbackTreatment(
  repoId: string,
  treatmentId: string
): Promise<Treatment> {
  return MOCK_TREATMENTS[0];
}
