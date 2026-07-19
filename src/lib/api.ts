import type { ApiError, Examination, ExaminationProgress, RepositorySubmission } from './types';
const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
export const apiConfigured = Boolean(baseUrl);
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl) throw { message: 'The Repo Doctor backend has not been configured.', code: 'BACKEND_UNAVAILABLE' } satisfies ApiError;
  const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 20_000);
  try { const response = await fetch(`${baseUrl}${path}`, { ...init, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...init?.headers } }); const payload: unknown = await response.json().catch(() => undefined);
    if (!response.ok) { const message = typeof payload === 'object' && payload && 'message' in payload && typeof payload.message === 'string' ? payload.message : `Request failed (${response.status}).`; throw { message, status: response.status } satisfies ApiError; } return payload as T;
  } catch (error) { if (error instanceof DOMException && error.name === 'AbortError') throw { message: 'The request timed out. Please try again.', code: 'TIMEOUT' } satisfies ApiError; throw error; } finally { window.clearTimeout(timeout); }
}
export const repositoryApi = { submit: (submission: RepositorySubmission) => request<Examination>('/repositories', { method: 'POST', body: JSON.stringify(submission) }) };
export const examinationApi = { progress: (id: string) => request<ExaminationProgress>(`/examinations/${encodeURIComponent(id)}/progress`) };
