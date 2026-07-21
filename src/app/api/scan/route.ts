import { NextResponse } from "next/server";
import { getRepositorySnapshot, parseGitHubRepositoryUrl } from "@/lib/server/github";
import { generateStructuredReview } from "@/lib/server/groq";

type Finding = { id: string; title: string; severity: "critical" | "high" | "medium" | "low"; category: string; summary: string; evidence: string; path: string | null; repairable: boolean };
type Review = { score: number; summary: string; findings: Finding[] };

function normalizeReview(value: Review): Review {
  const severity = new Set(["critical", "high", "medium", "low"]);
  const findings = Array.isArray(value.findings) ? value.findings.slice(0, 8).map((finding, index) => ({
    id: `finding-${index + 1}`,
    title: String(finding.title || "Repository finding"),
    severity: severity.has(finding.severity) ? finding.severity : "medium" as Finding["severity"],
    category: String(finding.category || "maintainability"),
    summary: String(finding.summary || "Review the supporting evidence."),
    evidence: String(finding.evidence || "Based on the scanned repository metadata."),
    path: typeof finding.path === "string" ? finding.path : null,
    repairable: Boolean(finding.repairable),
  })) : [];
  const impact = { critical: 28, high: 16, medium: 9, low: 3 };
  return {
    score: Math.max(0, 100 - findings.reduce((total, finding) => total + impact[finding.severity], 0)),
    summary: String(value.summary || "Repository structure reviewed."),
    findings,
  };
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json() as { url?: unknown };
    const parsed = parseGitHubRepositoryUrl(url);
    if (!parsed) return NextResponse.json({ message: "Enter a public GitHub repository URL in the form https://github.com/owner/repository." }, { status: 400 });
    const repository = await getRepositorySnapshot(parsed);
    const review = normalizeReview(await generateStructuredReview<Review>(
      "You are Repo Doctor, a conservative staff engineer. Analyze only the supplied public repository inventory and manifest excerpts. Never invent file contents, vulnerabilities, test coverage, line numbers, or credentials. Do not report missing GitHub topics, missing GitHub language metadata, or absent manifests as findings. If the evidence is insufficient, return an empty findings list. Report at most 6 concrete, evidence-backed findings. Do not recommend destructive commands. Return strict JSON only.",
      `Return this exact shape: {"score":0-100,"summary":"one sentence","findings":[{"title":"","severity":"critical|high|medium|low","category":"security|reliability|testing|dependencies|documentation|maintainability","summary":"","evidence":"what in the supplied inventory supports this","path":"optional file path or null","repairable":true}]}.\n\nRepository metadata:\n${JSON.stringify({ fullName: repository.fullName, description: repository.description, language: repository.language, topics: repository.topics, defaultBranch: repository.defaultBranch })}\n\nFile inventory (possibly truncated):\n${repository.files.join("\n")}\n\nSafe manifest excerpts:\n${JSON.stringify(repository.manifests)}`,
    ));
    return NextResponse.json({ repository, review, scannedAt: new Date().toISOString(), mode: "metadata-and-manifest" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not scan this repository.";
    const status = message.includes("not configured") ? 503 : message.includes("GitHub request failed (404)") ? 404 : 502;
    return NextResponse.json({ message }, { status });
  }
}
