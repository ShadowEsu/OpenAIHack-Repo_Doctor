import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const port = Number(process.env.PORT || 8787);
const examinations = new Map();

function send(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
  response.end(JSON.stringify(body));
}

function githubRepository(url) {
  const match = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/.exec(url);
  return match ? { owner: match[1], repo: match[2].replace(/\.git$/, '') } : null;
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 10_000) throw new Error('Request body is too large.');
  }
  try { return JSON.parse(body); } catch { throw new Error('Request body must be valid JSON.'); }
}

async function validateGitHubRepository(repository) {
  const response = await githubRequest(`/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repo)}`);
  if (response.status === 404) throw new Error('Repository was not found or is not public.');
  if (!response.ok) throw new Error(`GitHub could not validate this repository (${response.status}).`);
  return response.json();
}

async function githubRequest(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(`https://api.github.com${path}`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'repo-doctor' }, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('GitHub validation timed out. Please try again.');
    throw error;
  } finally { clearTimeout(timer); }
}

async function examineRepository(id, repository, metadata) {
  const examination = examinations.get(id);
  try {
    examination.stage = 'Reading repository languages';
    examination.message = 'Requesting GitHub language metadata.';
    const languagesResponse = await githubRequest(`/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repo)}/languages`);
    if (!languagesResponse.ok) throw new Error(`GitHub could not read repository languages (${languagesResponse.status}).`);
    examination.languages = await languagesResponse.json();
    examination.completed = 2;
    examination.stage = 'Mapping project structure';
    examination.message = 'Requesting the default-branch file tree.';
    const treeResponse = await githubRequest(`/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repo)}/git/trees/${encodeURIComponent(metadata.default_branch)}?recursive=1`);
    if (!treeResponse.ok) throw new Error(`GitHub could not read the repository tree (${treeResponse.status}).`);
    const tree = await treeResponse.json();
    examination.paths = Array.isArray(tree.tree) ? tree.tree.filter((item) => item.type === 'blob').map((item) => item.path) : [];
    examination.fileCount = examination.paths.length;
    examination.record = buildHealthRecord(examination);
    examination.completed = 3;
    examination.status = 'complete';
    examination.stage = 'Examination complete';
    examination.message = `Validated ${metadata.full_name}, mapped ${examination.fileCount} files, and recorded language metadata.`;
  } catch (error) {
    examination.status = 'failed';
    examination.stage = 'Examination failed';
    examination.message = error instanceof Error ? error.message : 'Repository examination failed.';
  }
}

function buildHealthRecord(examination) {
  const paths = examination.paths;
  const has = (pattern) => paths.some((path) => pattern.test(path));
  const examples = (pattern) => paths.filter((path) => pattern.test(path)).slice(0, 3);
  const testFiles = examples(/(^|\/)(test|tests|__tests__)(\/|$)|\.(test|spec)\.[^/]+$/i);
  const hasReadme = has(/^readme(?:\.md)?$/i);
  const hasCi = has(/^\.github\/workflows\//);
  const hasIgnore = has(/(^|\/)\.gitignore$/);
  const hasLockfile = has(/(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|poetry\.lock|Cargo\.lock|Gemfile\.lock)$/);
  const diagnoses = [];
  if (!hasCi) diagnoses.push({ severity: 'warning', title: 'No continuous-integration workflow found', path: '.github/workflows/', confidence: 'High', detail: 'The repository tree has no GitHub Actions workflow. Automated checks will not run on pull requests through GitHub Actions.' });
  if (!testFiles.length) diagnoses.push({ severity: 'warning', title: 'No conventional test files found', path: 'Repository tree', confidence: 'Medium', detail: 'No test, spec, or __tests__ path was found. This is a structural signal, not a statement about runtime coverage.' });
  if (!hasReadme) diagnoses.push({ severity: 'info', title: 'No root README found', path: 'README.md', confidence: 'High', detail: 'A root-level README was not found in the default branch.' });
  if (!hasLockfile) diagnoses.push({ severity: 'info', title: 'No recognized dependency lockfile found', path: 'Repository root', confidence: 'Medium', detail: 'A recognized dependency lockfile was not found. This may make dependency resolution less reproducible.' });
  if (!diagnoses.length) diagnoses.push({ severity: 'info', title: 'No structural hygiene gaps detected', path: 'Repository tree', confidence: 'Medium', detail: 'The initial structural checks found CI, test, documentation, and dependency-lock signals. This is not a substitute for a full code review.' });
  const score = Math.max(45, 100 - diagnoses.reduce((total, diagnosis) => total + (diagnosis.severity === 'warning' ? 12 : 5), 0));
  return { repository: examination.metadata.fullName, defaultBranch: examination.metadata.defaultBranch, fileCount: examination.fileCount, languages: Object.entries(examination.languages).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name]) => name), score, checks: [{ label: 'Documentation', value: hasReadme ? 100 : 55 }, { label: 'Automation', value: hasCi ? 100 : 45 }, { label: 'Test signals', value: testFiles.length ? 100 : 45 }, { label: 'Dependency hygiene', value: hasIgnore && hasLockfile ? 100 : hasIgnore || hasLockfile ? 70 : 45 }], diagnoses };
}

createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return send(response, 204, {});
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  if (request.method === 'GET' && url.pathname === '/api/health') return send(response, 200, { status: 'ok' });
  if (request.method === 'POST' && url.pathname === '/api/repositories') {
    try {
      const body = await readJson(request);
      const repository = body?.source === 'github' && typeof body?.url === 'string' ? githubRepository(body.url) : null;
      if (!repository) return send(response, 400, { message: 'Submit a public GitHub URL in the form https://github.com/owner/repository.' });
      const metadata = await validateGitHubRepository(repository);
      const id = randomUUID();
      examinations.set(id, { status: 'running', completed: 1, total: 3, stage: 'Repository validated', message: 'The public GitHub repository is reachable.', metadata: { fullName: metadata.full_name, defaultBranch: metadata.default_branch } });
      void examineRepository(id, repository, metadata);
      return send(response, 201, { id, status: 'running' });
    } catch (error) { return send(response, 502, { message: error instanceof Error ? error.message : 'Repository validation failed.' }); }
  }
  const progressMatch = /^\/api\/examinations\/([^/]+)\/progress$/.exec(url.pathname);
  if (request.method === 'GET' && progressMatch) {
    const examination = examinations.get(progressMatch[1]);
    if (!examination) return send(response, 404, { message: 'Examination not found.' });
    return send(response, examination.status === 'failed' ? 502 : 200, { stage: examination.stage, message: examination.message, completed: examination.completed, total: examination.total });
  }
  const examinationMatch = /^\/api\/examinations\/([^/]+)$/.exec(url.pathname);
  if (request.method === 'GET' && examinationMatch) {
    const examination = examinations.get(examinationMatch[1]);
    if (!examination) return send(response, 404, { message: 'Examination not found.' });
    if (examination.status === 'failed') return send(response, 502, { message: examination.message });
    if (examination.status !== 'complete') return send(response, 409, { message: 'Examination is still running.' });
    return send(response, 200, examination.record);
  }
  return send(response, 404, { message: 'Route not found.' });
}).listen(port, () => console.log(`Repo Doctor API listening on http://localhost:${port}/api`));
