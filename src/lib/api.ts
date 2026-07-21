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

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
).replace(/\/$/, "");

const EXAMINATION_STAGE_NAMES = [
  "Validating source",
  "Extracting files",
  "Mapping project structure",
  "Detecting technologies",
  "Inspecting imports",
  "Reviewing dependencies",
  "Examining tests",
  "Reviewing documentation",
  "Generating diagnoses",
  "Calculating health score",
];

const examinationStarts = new Map<string, { createdAt: number; request: Promise<Examination> }>();

type RawRepository = {
  id: string;
  name: string;
  source_url: string | null;
  default_branch: string | null;
  primary_language: string | null;
  frameworks: string[];
  repository_size: number;
  created_at: string;
};

type RawExamination = {
  id: string;
  repository_id: string;
  status: string;
  current_stage: string | null;
  completed_stages: string[];
  started_at: string | null;
  completed_at: string | null;
  health_score: number | null;
  health_grade: string | null;
  dimension_scores: Record<string, number>;
  summary: string | null;
  error_message: string | null;
};

type RawProgress = {
  examination_id: string;
  status: string;
  current_stage: string | null;
  completed_stages: string[];
  all_stages: string[];
  error_message: string | null;
};

type RawDiagnosis = {
  id: string;
  examination_id: string;
  title: string;
  category: string;
  severity: string;
  confidence: number;
  explanation: string;
  why_it_matters: string;
  recommended_action: string;
  evidence: string | null;
  repairable: boolean;
  repair_risk: string | null;
  repair_effort: string | null;
  status: string;
  created_at: string;
  files: Array<{ file_path: string; start_line: number | null; end_line: number | null }>;
};

type RawTreatment = {
  id: string;
  diagnosis_id: string;
  status: string;
  proposal_summary: string;
  side_effects: string | null;
  patch: Array<{ path: string; operation: string; new_content: string | null }>;
  diff_text: string | null;
  verification_plan: string[];
  risk_level: string;
  insertions: number;
  deletions: number;
  health_score_before: number | null;
  health_score_after: number | null;
  created_at: string;
  completed_at: string | null;
};

type RawVerification = {
  lint_status: string;
  typecheck_status: string;
  test_status: string;
  build_status: string;
  syntax_status: string;
  lint_output: string | null;
  typecheck_output: string | null;
  test_output: string | null;
  build_output: string | null;
  syntax_output: string | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? body.message ?? `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function mapRepository(repo: RawRepository): Repository {
  const branch = repo.default_branch ?? "main";
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.source_url?.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "") ?? repo.name,
    url: repo.source_url ?? "",
    branch,
    defaultBranch: branch,
    description: null,
    language: repo.primary_language,
    size: repo.repository_size,
    technologies: repo.frameworks.map((name) => ({ name, version: null, confidence: 1 })),
    createdAt: repo.created_at,
    lastExaminedAt: null,
  };
}

function mapStatus(status: string): Examination["status"] {
  if (status === "pending") return "queued";
  if (status === "running") return "scanning";
  if (status === "completed" || status === "failed") return status;
  return "scanning";
}

function mapHealthGrade(grade: string | null): HealthRecord["grade"] {
  switch (grade?.toLowerCase()) {
    case "excellent":
      return "excellent";
    case "healthy":
      return "good";
    case "critical":
    case "unhealthy":
      return "critical";
    default:
      return "needs_attention";
  }
}

function mapExamination(exam: RawExamination | RawProgress): Examination {
  const names = "all_stages" in exam && exam.all_stages.length
    ? exam.all_stages
    : EXAMINATION_STAGE_NAMES;
  const completed = new Set(exam.completed_stages);
  const current = exam.current_stage;
  return {
    id: "examination_id" in exam ? exam.examination_id : exam.id,
    repositoryId: "repository_id" in exam ? exam.repository_id : "",
    status: mapStatus(exam.status),
    progress: names.length ? Math.round((completed.size / names.length) * 100) : 0,
    currentStage: current ?? (exam.status === "completed" ? "completed" : "queued"),
    stages: names.map((name) => ({
      name,
      status: completed.has(name)
        ? "completed"
        : name === current && exam.status !== "failed"
          ? "running"
          : name === current
            ? "failed"
            : "pending",
      startedAt: null,
      completedAt: null,
    })),
    startedAt: "started_at" in exam && exam.started_at ? exam.started_at : new Date().toISOString(),
    completedAt: "completed_at" in exam ? exam.completed_at : null,
    error: exam.error_message,
  };
}

function mapDiagnosis(repoId: string, diagnosis: RawDiagnosis): Diagnosis {
  const files = diagnosis.files.map((file) => ({
    path: file.file_path,
    lines: file.start_line == null
      ? []
      : [[file.start_line, file.end_line ?? file.start_line] as [number, number]],
    relevance: diagnosis.explanation,
  }));
  return {
    id: diagnosis.id,
    repositoryId: repoId,
    healthRecordId: diagnosis.examination_id,
    title: diagnosis.title,
    summary: diagnosis.why_it_matters,
    description: `${diagnosis.explanation}\n\nRecommended action: ${diagnosis.recommended_action}`,
    severity: diagnosis.severity as Diagnosis["severity"],
    confidence: diagnosis.confidence,
    category: diagnosis.category,
    affectedFiles: files,
    evidence: diagnosis.evidence ? [{
      type: "code",
      description: diagnosis.evidence,
      filePath: files[0]?.path ?? null,
      lines: files[0]?.lines ?? null,
      snippet: null,
    }] : [],
    repairable: diagnosis.repairable,
    repairRisk: (diagnosis.repair_risk ?? "medium") as Diagnosis["repairRisk"],
    repairEffort: (diagnosis.repair_effort ?? "moderate") as Diagnosis["repairEffort"],
    status: diagnosis.status === "treated" ? "resolved" : diagnosis.status as Diagnosis["status"],
    createdAt: diagnosis.created_at,
  };
}

function verificationSteps(runs: RawVerification[]): Treatment["verification"] {
  const run = runs.at(-1);
  if (!run) return { steps: [], overallStatus: "pending" };
  const checks = [
    ["Syntax", "syntax", run.syntax_status, run.syntax_output],
    ["Linting", "lint", run.lint_status, run.lint_output],
    ["Type checking", "typecheck", run.typecheck_status, run.typecheck_output],
    ["Tests", "test", run.test_status, run.test_output],
    ["Build", "build", run.build_status, run.build_output],
  ] as const;
  const steps = checks.map(([name, command, status, output]) => ({
    name,
    command,
    status: (status === "skipped" ? "unavailable" : status) as Treatment["verification"]["steps"][number]["status"],
    output,
    duration: null,
  }));
  const statuses = steps.map((step) => step.status);
  const overallStatus = statuses.includes("failed")
    ? "failed"
    : statuses.some((status) => status === "passed")
      ? "passed"
      : "pending";
  return { steps, overallStatus };
}

async function mapTreatment(repoId: string, raw: RawTreatment): Promise<Treatment> {
  const runs = await request<RawVerification[]>(`/treatments/${raw.id}/verification`);
  const status = raw.status === "succeeded" ? "completed" : raw.status;
  return {
    id: raw.id,
    repositoryId: repoId,
    diagnosisId: raw.diagnosis_id,
    status: status as Treatment["status"],
    proposal: {
      summary: raw.proposal_summary,
      risk: raw.risk_level as Treatment["proposal"]["risk"],
      affectedFiles: raw.patch.map((operation) => operation.path),
      assumptions: raw.side_effects ? [raw.side_effects] : [],
      verificationPlan: raw.verification_plan,
    },
    patches: raw.patch.map((operation, index) => ({
      path: operation.path,
      operation: (operation.operation === "create" ? "add" : operation.operation) as Treatment["patches"][number]["operation"],
      additions: index === 0 ? raw.insertions : 0,
      deletions: index === 0 ? raw.deletions : 0,
      diff: index === 0 ? raw.diff_text ?? "" : "",
      explanation: raw.proposal_summary,
    })),
    verification: verificationSteps(runs),
    scoreBefore: raw.health_score_before,
    scoreAfter: raw.health_score_after,
    createdAt: raw.created_at,
    completedAt: raw.completed_at,
  };
}

export async function getRepositories(): Promise<Repository[]> {
  return (await request<RawRepository[]>("/repositories")).map(mapRepository);
}

export async function getRepository(id: string): Promise<Repository> {
  return mapRepository(await request<RawRepository>(`/repositories/${id}`));
}

export async function connectRepository(url: string): Promise<Repository> {
  return mapRepository(await request<RawRepository>("/repositories/github", {
    method: "POST",
    body: JSON.stringify({ url }),
  }));
}

export async function uploadRepository(file: File): Promise<Repository> {
  const body = new FormData();
  body.append("file", file);
  return mapRepository(await request<RawRepository>("/repositories/upload", { method: "POST", body }));
}

export async function getExamination(repoId: string): Promise<Examination> {
  return mapExamination(await request<RawExamination>(`/repositories/${repoId}/examinations/latest`));
}

export async function getExaminationProgress(examinationId: string): Promise<Examination> {
  return mapExamination(await request<RawProgress>(`/examinations/${examinationId}/progress`));
}

export async function startExamination(repoId: string): Promise<Examination> {
  const existing = examinationStarts.get(repoId);
  if (existing && Date.now() - existing.createdAt < 2_000) return existing.request;
  const startRequest = request<RawExamination>(`/repositories/${repoId}/examinations`, { method: "POST" })
    .then(mapExamination);
  examinationStarts.set(repoId, { createdAt: Date.now(), request: startRequest });
  return startRequest;
}

export async function getHealthRecord(repoId: string): Promise<HealthRecord> {
  const exam = await request<RawExamination>(`/repositories/${repoId}/examinations/latest`);
  const record = await request<{
    examination: RawExamination;
    critical_count: number;
    high_count: number;
    warning_count: number;
    improvement_count: number;
  }>(`/examinations/${exam.id}/health-record`);
  const dimensions = Object.entries(record.examination.dimension_scores ?? {});
  return {
    id: exam.id,
    repositoryId: repoId,
    examinationId: exam.id,
    score: record.examination.health_score ?? 0,
    grade: mapHealthGrade(record.examination.health_grade),
    previousScore: null,
    scoreChange: null,
    dimensions: dimensions.map(([name, score]) => ({
      name: name.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      score,
      weight: dimensions.length ? 1 / dimensions.length : 0,
      findings: name === "security" ? record.critical_count : 0,
      summary: `${name.replace(/_/g, " ")} health score`,
    })),
    summary: record.examination.summary ?? "Repository examination completed.",
    examinedAt: record.examination.completed_at ?? new Date().toISOString(),
  };
}

export async function getDiagnoses(repoId: string): Promise<Diagnosis[]> {
  const exam = await request<RawExamination>(`/repositories/${repoId}/examinations/latest`);
  return (await request<RawDiagnosis[]>(`/examinations/${exam.id}/diagnoses`))
    .map((diagnosis) => mapDiagnosis(repoId, diagnosis));
}

export async function getDiagnosis(repoId: string, diagnosisId: string): Promise<Diagnosis | undefined> {
  return mapDiagnosis(repoId, await request<RawDiagnosis>(`/diagnoses/${diagnosisId}`));
}

export async function updateDiagnosisStatus(
  repoId: string,
  diagnosisId: string,
  status: "open" | "resolved" | "dismissed"
): Promise<Diagnosis | undefined> {
  const raw = await request<RawDiagnosis>(`/diagnoses/${diagnosisId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: status === "resolved" ? "treated" : status }),
  });
  return mapDiagnosis(repoId, raw);
}

export async function getTreatments(repoId: string): Promise<Treatment[]> {
  const treatments = await request<RawTreatment[]>(`/repositories/${repoId}/treatments`);
  return Promise.all(treatments.map((treatment) => mapTreatment(repoId, treatment)));
}

export async function getTreatment(repoId: string, treatmentId: string): Promise<Treatment | undefined> {
  return mapTreatment(repoId, await request<RawTreatment>(`/treatments/${treatmentId}`));
}

export async function createTreatment(repoId: string, diagnosisId: string): Promise<Treatment> {
  const treatment = await request<RawTreatment>(`/diagnoses/${diagnosisId}/treatment-proposal`, { method: "POST" });
  return mapTreatment(repoId, treatment);
}

export async function approveTreatment(repoId: string, treatmentId: string): Promise<Treatment> {
  await request<RawTreatment>(`/treatments/${treatmentId}/approve`, { method: "POST" });
  await request<RawTreatment>(`/treatments/${treatmentId}/apply`, { method: "POST" });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const treatment = await request<RawTreatment>(`/treatments/${treatmentId}`);
    if (["succeeded", "failed"].includes(treatment.status)) return mapTreatment(repoId, treatment);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return getTreatment(repoId, treatmentId) as Promise<Treatment>;
}

export async function rollbackTreatment(repoId: string, treatmentId: string): Promise<Treatment> {
  return mapTreatment(repoId, await request<RawTreatment>(`/treatments/${treatmentId}/rollback`, { method: "POST" }));
}

export function getTreatmentDownloadUrl(treatmentId: string): string {
  return `${API_BASE_URL}/treatments/${treatmentId}/download`;
}
