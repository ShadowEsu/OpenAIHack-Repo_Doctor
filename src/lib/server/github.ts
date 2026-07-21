import "server-only";

const GITHUB_REPOSITORY_URL = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/;
const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "repo-doctor",
};

export type RepositorySnapshot = {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  defaultBranch: string;
  description: string | null;
  language: string | null;
  topics: string[];
  files: string[];
  manifests: Record<string, string>;
};

export function parseGitHubRepositoryUrl(value: unknown) {
  const match = typeof value === "string" ? GITHUB_REPOSITORY_URL.exec(value.trim()) : null;
  if (!match) return null;

  return { owner: match[1], repository: match[2].replace(/\.git$/, "") };
}

async function githubJson<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: GITHUB_HEADERS,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`GitHub request failed (${response.status}).`);
  return response.json() as Promise<T>;
}

export async function getRepositoryFileText(owner: string, repository: string, path: string) {
  try {
    if (!/^[A-Za-z0-9._/-]+$/.test(path) || path.includes("..")) return null;
    const content = await githubJson<{ content?: string; encoding?: string }>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`,
    );
    if (content.encoding !== "base64" || !content.content) return null;
    return Buffer.from(content.content.replace(/\n/g, ""), "base64").toString("utf8").slice(0, 12_000);
  } catch {
    return null;
  }
}

export async function getRepositorySnapshot(input: { owner: string; repository: string }): Promise<RepositorySnapshot> {
  const basePath = `/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repository)}`;
  const [repo, tree] = await Promise.all([
    githubJson<{ full_name: string; name: string; html_url: string; default_branch: string; description: string | null; language: string | null; topics?: string[] }>(basePath),
    githubJson<{ tree?: Array<{ path?: string; type?: string }> }>(`${basePath}/git/trees/HEAD?recursive=1`),
  ]);
  const files = (tree.tree ?? [])
    .filter((entry) => entry.type === "blob" && typeof entry.path === "string")
    .map((entry) => entry.path as string)
    .filter((path) => !path.includes("node_modules/") && !path.includes(".git/"))
    .slice(0, 350);
  const candidateFiles = ["package.json", "README.md", "pyproject.toml", "requirements.txt", "go.mod", "Cargo.toml"];
  const manifests = Object.fromEntries(
    (await Promise.all(candidateFiles.filter((path) => files.includes(path)).map(async (path) => [path, await getRepositoryFileText(input.owner, input.repository, path)] as const)))
      .filter(([, content]) => content !== null),
  ) as Record<string, string>;

  return {
    owner: input.owner,
    name: repo.name,
    fullName: repo.full_name,
    url: repo.html_url,
    defaultBranch: repo.default_branch,
    description: repo.description,
    language: repo.language,
    topics: repo.topics ?? [],
    files,
    manifests,
  };
}
