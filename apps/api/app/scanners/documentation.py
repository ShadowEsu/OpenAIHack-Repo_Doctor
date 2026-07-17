"""Detect confusing or missing setup documentation."""
from __future__ import annotations

import re

from app.scanners.base import RepositoryScanner, ScanFinding
from app.services.inventory import RepositoryContext

PLACEHOLDER_RE = re.compile(r"(lorem ipsum|coming soon|todo:? write|<project.name>|{{)", re.IGNORECASE)


class DocumentationScanner(RepositoryScanner):
    scanner_id = "documentation"
    category = "documentation"
    supported_languages = []

    def scan(self, ctx: RepositoryContext) -> list[ScanFinding]:
        findings: list[ScanFinding] = []
        readme = None
        for name in ("README.md", "readme.md", "README.rst", "README.txt", "README"):
            if (ctx.root / name).exists():
                readme = name
                break

        if readme is None:
            findings.append(ScanFinding(
                scanner_id=self.scanner_id,
                category=self.category,
                title="The repository has no README",
                severity="medium",
                confidence=0.98,
                evidence="No README file was found at the repository root.",
                repairable=True,
                repair_type="improve_readme",
            ))
            return findings

        text = ctx.read_text(readme) or ""
        lower = text.lower()
        word_count = len(text.split())

        if word_count < 30:
            findings.append(ScanFinding(
                scanner_id=self.scanner_id,
                category=self.category,
                title="README is too short to explain setup",
                severity="medium",
                confidence=0.9,
                evidence=f"'{readme}' contains only {word_count} words and cannot document setup.",
                file_path=readme,
                repairable=True,
                repair_type="improve_readme",
            ))

        if PLACEHOLDER_RE.search(text):
            findings.append(ScanFinding(
                scanner_id=self.scanner_id,
                category=self.category,
                title="README contains placeholder content",
                severity="low",
                confidence=0.85,
                evidence=f"'{readme}' contains placeholder text that was never replaced.",
                file_path=readme,
                repairable=True,
                repair_type="improve_readme",
            ))

        has_install = any(k in lower for k in ("npm install", "pnpm install", "yarn install",
                                               "pip install", "poetry install", "installation", "install"))
        has_run = any(k in lower for k in ("npm run", "pnpm run", "yarn dev", "npm start",
                                           "python ", "uvicorn", "flask run", "manage.py", "usage",
                                           "getting started", "quick start"))
        needs_setup_docs = bool(ctx.package_json or ctx.python_requirements)

        if needs_setup_docs and not has_install:
            findings.append(ScanFinding(
                scanner_id=self.scanner_id,
                category=self.category,
                title="README is missing installation steps",
                severity="medium",
                confidence=0.8,
                evidence=f"'{readme}' does not describe how to install dependencies, "
                         "although the repository declares a dependency manifest.",
                file_path=readme,
                repairable=True,
                repair_type="improve_readme",
            ))
        if needs_setup_docs and not has_run:
            findings.append(ScanFinding(
                scanner_id=self.scanner_id,
                category=self.category,
                title="README is missing run instructions",
                severity="medium",
                confidence=0.8,
                evidence=f"'{readme}' does not explain how to run the project locally.",
                file_path=readme,
                repairable=True,
                repair_type="improve_readme",
            ))

        # Commands referenced in README that disagree with package scripts
        if ctx.package_json:
            scripts = set(ctx.package_json.get("scripts", {}))
            for match in re.finditer(r"npm run ([a-zA-Z0-9:_-]+)", text):
                script = match.group(1)
                if script not in scripts:
                    line = text.count("\n", 0, match.start()) + 1
                    findings.append(ScanFinding(
                        scanner_id=self.scanner_id,
                        category=self.category,
                        title=f"README references a missing npm script: '{script}'",
                        severity="low",
                        confidence=0.9,
                        evidence=f"{readme} line {line} says 'npm run {script}' but package.json "
                                 "has no such script.",
                        file_path=readme,
                        start_line=line,
                        end_line=line,
                    ))
        return findings
