import { NextResponse } from "next/server";

const githubUrl = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/;

export async function POST(request: Request) {
  try {
    const { url } = await request.json() as { url?: unknown };
    const match = typeof url === "string" ? githubUrl.exec(url.trim()) : null;
    if (!match) return NextResponse.json({ message: "Enter a public GitHub repository URL in the form https://github.com/owner/repository." }, { status: 400 });

    const [owner, repository] = [match[1], match[2].replace(/\.git$/, "")];
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "repo-doctor" },
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });
    if (response.status === 404) return NextResponse.json({ message: "Repository was not found or is not public." }, { status: 404 });
    if (!response.ok) return NextResponse.json({ message: `GitHub validation failed (${response.status}).` }, { status: 502 });

    const data = await response.json() as { full_name: string; name: string; html_url: string; default_branch: string; description: string | null; language: string | null; size: number; created_at: string };
    return NextResponse.json({
      id: encodeURIComponent(data.full_name), name: data.name, fullName: data.full_name, url: data.html_url,
      branch: data.default_branch, defaultBranch: data.default_branch, description: data.description,
      language: data.language, size: data.size, technologies: data.language ? [{ name: data.language, version: null, confidence: 1 }] : [],
      createdAt: data.created_at, lastExaminedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError" ? "GitHub validation timed out. Please try again." : "Could not validate this repository.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
