import { NextResponse } from "next/server";
import { generateStructuredReview } from "@/lib/server/groq";
import { getRepositoryFileText } from "@/lib/server/github";

type Repair = { summary: string; risk: "low" | "medium" | "high"; assumptions: string[]; verification: string[]; patch: string };

export async function POST(request: Request) {
  try {
    const body = await request.json() as { repository?: { fullName?: unknown; files?: unknown }; finding?: { title?: unknown; summary?: unknown; evidence?: unknown; path?: unknown } };
    if (!body.repository?.fullName || !body.finding?.title) return NextResponse.json({ message: "A scanned repository and finding are required." }, { status: 400 });
    const [owner, repository] = String(body.repository.fullName).split("/", 2);
    const path = typeof body.finding.path === "string" ? body.finding.path : null;
    const source = owner && repository && path ? await getRepositoryFileText(owner, repository, path) : null;
    const repair = await generateStructuredReview<Repair>(
      "You are Repo Doctor's repair planner. Propose a small, review-only unified diff for the selected finding. You cannot access code beyond the supplied file inventory, so do not fabricate exact source edits. If there is not enough safe evidence, produce an empty patch and explain what the engineer should inspect. Never include secrets, binaries, lockfile rewrites, shell commands that delete data, or claims that a patch has been applied. Return strict JSON only.",
      `Return exactly {"summary":"","risk":"low|medium|high","assumptions":[""],"verification":[""],"patch":"unified diff or empty string"}.\n\nRepository: ${String(body.repository.fullName)}\nKnown files:\n${Array.isArray(body.repository.files) ? body.repository.files.slice(0, 350).join("\n") : ""}\n\nFinding:\n${JSON.stringify(body.finding)}\n\nCited file content (only use this if present):\n${source ?? "No cited source file was safely available. Return an empty patch."}`,
    );
    return NextResponse.json({ ...repair, patch: typeof repair.patch === "string" ? repair.patch : "", applied: false });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Could not generate a repair proposal." }, { status: 502 });
  }
}
