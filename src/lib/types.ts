export type Severity = 'critical' | 'warning' | 'info';
export interface ApiError { message: string; status?: number; code?: string; }
export interface RepositorySubmission { source: 'github'; url: string; }
export interface Examination { id: string; status: 'queued' | 'running' | 'complete' | 'failed'; }
export interface ExaminationProgress { stage: string; completed: number; total: number; message?: string; }
