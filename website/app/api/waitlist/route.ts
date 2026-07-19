import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WaitlistEntry = {
  email: string;
  submittedAt: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const waitlistDirectory = path.join(process.cwd(), "data");
const waitlistPath = path.join(waitlistDirectory, "waitlist.json");

async function readEntries(): Promise<WaitlistEntry[]> {
  try {
    return JSON.parse(await readFile(waitlistPath, "utf8")) as WaitlistEntry[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return Response.json({ error: "Send a valid email address." }, { status: 400 });
  }

  if (!emailPattern.test(email)) {
    return Response.json({ error: "Send a valid email address." }, { status: 400 });
  }

  try {
    await mkdir(waitlistDirectory, { recursive: true });
    const entries = await readEntries();
    const alreadyRegistered = entries.some((entry) => entry.email === email);
    if (!alreadyRegistered) {
      entries.push({ email, submittedAt: new Date().toISOString() });
      await writeFile(waitlistPath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
    }
    return Response.json({ ok: true, alreadyRegistered });
  } catch {
    return Response.json({ error: "We couldn't save your email. Please try again." }, { status: 500 });
  }
}
