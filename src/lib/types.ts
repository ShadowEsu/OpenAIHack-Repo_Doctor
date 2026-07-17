// Repository
export interface Repository {
  id: string;
  name: string;
  fullName: string;
  url: string;
  branch: string;
  defaultBranch: string;
  description: string | null;
  language: string | null;
  size: number;
  technologies: Technology[];
  createdAt: string;
  lastExaminedAt: string | null;
}

export interface Technology {
  name: string;
  version: string | null;
  confidence: number;
}

// Examination
export type ExaminationStatus =
  | "queued"
  | "validating"
  | "extracting"
  | "mapping"
  | "scanning"
  | "diagnosing"
  | "scoring"
  | "completed"
  | "failed";

export interface Examination {
  id: string;
  repositoryId: string;
  status: ExaminationStatus;
  progress: number;
  currentStage: string;
  stages: ExaminationStage[];
  startedAt: string;
  completedAt: string | null;
  error: string | null;
}

export interface ExaminationStage {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: string | null;
  completedAt: string | null;
}

// Health
export interface HealthRecord {
  id: string;
  repositoryId: string;
  examinationId: string;
  score: number;
  grade: HealthGrade;
  previousScore: number | null;
  scoreChange: number | null;
  dimensions: HealthDimension[];
  summary: string;
  examinedAt: string;
}

export type HealthGrade = "excellent" | "good" | "needs_attention" | "critical";

export interface HealthDimension {
  name: string;
  score: number;
  weight: number;
  findings: number;
  summary: string;
}

// Diagnosis
export type DiagnosisSeverity = "critical" | "high" | "medium" | "low";
export type DiagnosisStatus = "open" | "resolved" | "dismissed";

export interface Diagnosis {
  id: string;
  repositoryId: string;
  healthRecordId: string;
  title: string;
  summary: string;
  description: string;
  severity: DiagnosisSeverity;
  confidence: number;
  category: string;
  affectedFiles: AffectedFile[];
  evidence: Evidence[];
  repairable: boolean;
  repairRisk: "low" | "medium" | "high";
  repairEffort: "quick" | "moderate" | "significant";
  status: DiagnosisStatus;
  createdAt: string;
}

export interface AffectedFile {
  path: string;
  lines: [number, number][];
  relevance: string;
}

export interface Evidence {
  type: "code" | "config" | "dependency" | "pattern";
  description: string;
  filePath: string | null;
  lines: [number, number][] | null;
  snippet: string | null;
}

// Treatment
export type TreatmentStatus =
  | "proposed"
  | "approved"
  | "applying"
  | "verifying"
  | "completed"
  | "failed"
  | "rolled_back";

export interface Treatment {
  id: string;
  repositoryId: string;
  diagnosisId: string;
  status: TreatmentStatus;
  proposal: TreatmentProposal;
  patches: FilePatch[];
  verification: VerificationRun;
  scoreBefore: number | null;
  scoreAfter: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface TreatmentProposal {
  summary: string;
  risk: "low" | "medium" | "high";
  affectedFiles: string[];
  assumptions: string[];
  verificationPlan: string[];
}

export interface FilePatch {
  path: string;
  operation: "add" | "modify" | "delete";
  additions: number;
  deletions: number;
  diff: string;
  explanation: string;
}

export interface VerificationRun {
  steps: VerificationStep[];
  overallStatus: "pending" | "passed" | "failed" | "partial";
}

export interface VerificationStep {
  name: string;
  command: string;
  status: "pending" | "running" | "passed" | "failed" | "unavailable" | "timeout";
  output: string | null;
  duration: number | null;
}

// API Error
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
