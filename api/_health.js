function parseRepository(url) {
  const match = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/.exec(url);
  return match ? { owner: match[1], repo: match[2].replace(/\.git$/, '') } : null;
}

async function github(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(`https://api.github.com${path}`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'repo-doctor' }, signal: controller.signal });
    if (!response.ok) throw new Error(response.status === 404 ? 'Repository was not found or is not public.' : `GitHub request failed (${response.status}).`);
    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('GitHub validation timed out. Please try again.');
    throw error;
  } finally { clearTimeout(timer); }
}

export async function examine(url) {
  const repository = parseRepository(url);
  if (!repository) throw new Error('Submit a public GitHub URL in the form https://github.com/owner/repository.');
  const base = `/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repo)}`;
  const metadata = await github(base);
  const [languages, tree] = await Promise.all([github(`${base}/languages`), github(`${base}/git/trees/${encodeURIComponent(metadata.default_branch)}?recursive=1`)]);
  const paths = Array.isArray(tree.tree) ? tree.tree.filter((item) => item.type === 'blob').map((item) => item.path) : [];
  const has = (pattern) => paths.some((path) => pattern.test(path));
  const testFiles = paths.filter((path) => /(^|\/)(test|tests|__tests__)(\/|$)|\.(test|spec)\.[^/]+$/i.test(path)).slice(0, 3);
  const hasReadme = has(/^readme(?:\.md)?$/i); const hasCi = has(/^\.github\/workflows\//); const hasIgnore = has(/(^|\/)\.gitignore$/); const hasLockfile = has(/(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|poetry\.lock|Cargo\.lock|Gemfile\.lock)$/);
  const diagnoses = [];
  if (!hasCi) diagnoses.push({ severity: 'warning', title: 'No continuous-integration workflow found', path: '.github/workflows/', confidence: 'High', detail: 'The repository tree has no GitHub Actions workflow. Automated checks will not run on pull requests through GitHub Actions.' });
  if (!testFiles.length) diagnoses.push({ severity: 'warning', title: 'No conventional test files found', path: 'Repository tree', confidence: 'Medium', detail: 'No test, spec, or __tests__ path was found. This is a structural signal, not a statement about runtime coverage.' });
  if (!hasReadme) diagnoses.push({ severity: 'info', title: 'No root README found', path: 'README.md', confidence: 'High', detail: 'A root-level README was not found in the default branch.' });
  if (!hasLockfile) diagnoses.push({ severity: 'info', title: 'No recognized dependency lockfile found', path: 'Repository root', confidence: 'Medium', detail: 'A recognized dependency lockfile was not found. This may make dependency resolution less reproducible.' });
  if (!diagnoses.length) diagnoses.push({ severity: 'info', title: 'No structural hygiene gaps detected', path: 'Repository tree', confidence: 'Medium', detail: 'The initial structural checks found CI, test, documentation, and dependency-lock signals. This is not a substitute for a full code review.' });
  const score = Math.max(45, 100 - diagnoses.reduce((total, diagnosis) => total + (diagnosis.severity === 'warning' ? 12 : 5), 0));
  return { repository: metadata.full_name, defaultBranch: metadata.default_branch, fileCount: paths.length, languages: Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name]) => name), score, checks: [{ label: 'Documentation', value: hasReadme ? 100 : 55 }, { label: 'Automation', value: hasCi ? 100 : 45 }, { label: 'Test signals', value: testFiles.length ? 100 : 45 }, { label: 'Dependency hygiene', value: hasIgnore && hasLockfile ? 100 : hasIgnore || hasLockfile ? 70 : 45 }], diagnoses };
}

export function encodeRecord(record) { return Buffer.from(JSON.stringify(record)).toString('base64url'); }
export function decodeRecord(id) { try { return JSON.parse(Buffer.from(id, 'base64url').toString('utf8')); } catch { return null; } }
export function json(response, status, body) { response.status(status).json(body); }
