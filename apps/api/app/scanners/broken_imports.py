"""Detect broken local imports, missing manifest packages, and duplicate imports."""
from __future__ import annotations

from collections import Counter

from app.scanners.base import RepositoryScanner, ScanFinding
from app.services.import_graph import build_import_graph
from app.services.inventory import RepositoryContext

PYTHON_STDLIB_HINT = {
    "os", "sys", "re", "json", "math", "time", "datetime", "pathlib", "typing",
    "collections", "itertools", "functools", "subprocess", "logging", "unittest",
    "abc", "io", "shutil", "tempfile", "random", "string", "uuid", "hashlib",
    "dataclasses", "enum", "asyncio", "contextlib", "argparse", "csv", "sqlite3",
    "http", "urllib", "socket", "threading", "multiprocessing", "copy", "pickle",
    "base64", "secrets", "statistics", "textwrap", "traceback", "warnings", "zipfile",
    "glob", "inspect", "signal", "struct", "types", "weakref", "queue", "heapq", "bisect",
    "operator", "decimal", "fractions", "numbers", "array", "email", "html", "xml", "ast",
    "importlib", "pkgutil", "platform", "getpass", "configparser", "codecs", "unicodedata",
}


class BrokenImportsScanner(RepositoryScanner):
    scanner_id = "broken_imports"
    category = "reliability"
    supported_languages = ["JavaScript", "TypeScript", "Python"]

    def scan(self, ctx: RepositoryContext) -> list[ScanFinding]:
        findings: list[ScanFinding] = []
        graph = build_import_graph(ctx)

        declared_js = set()
        if ctx.package_json:
            declared_js = set(ctx.package_json.get("dependencies", {})) | set(
                ctx.package_json.get("devDependencies", {})
            ) | set(ctx.package_json.get("peerDependencies", {}))

        # 1) Local imports that resolve to no file
        for imp in graph.imports:
            if imp.kind == "local" and imp.resolved is None:
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"Import points to a missing file: '{imp.spec}'",
                    severity="high",
                    confidence=0.9 if imp.spec.startswith(".") else 0.6,
                    evidence=(
                        f"{imp.file} line {imp.line} imports '{imp.spec}', "
                        "but no matching file exists in the repository."
                    ),
                    file_path=imp.file,
                    start_line=imp.line,
                    end_line=imp.line,
                    raw_metadata={"spec": imp.spec},
                ))
            elif imp.kind == "alias" and imp.resolved is None:
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"Aliased import could not be resolved: '{imp.spec}'",
                    severity="medium",
                    confidence=0.5,
                    evidence=(
                        f"{imp.file} line {imp.line} imports '{imp.spec}'. The alias could not be "
                        "resolved against common roots (src/, app/). This may be a custom alias "
                        "defined in tsconfig paths, so confidence is limited."
                    ),
                    file_path=imp.file,
                    start_line=imp.line,
                    end_line=imp.line,
                    raw_metadata={"spec": imp.spec},
                ))

        # 2) Package imports missing from the manifest (JS only; Python stdlib is huge)
        if ctx.package_json:
            for pkg, files in graph.package_imports.items():
                if pkg in declared_js:
                    continue
                first_file = files[0]
                if not first_file.endswith((".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs")):
                    continue
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"Package '{pkg}' is imported but not declared in package.json",
                    severity="high",
                    confidence=0.8,
                    evidence=(
                        f"'{pkg}' is imported in {len(files)} file(s) (e.g. {first_file}) but does not "
                        "appear in dependencies or devDependencies. Installs from a clean checkout will fail."
                    ),
                    file_path=first_file,
                    raw_metadata={"package": pkg, "files": files[:10]},
                ))

        # 3) Duplicate imports of the same specifier within one file
        per_file: dict[str, Counter] = {}
        lines_by_key: dict[tuple, list[int]] = {}
        for imp in graph.imports:
            per_file.setdefault(imp.file, Counter())[imp.spec] += 1
            lines_by_key.setdefault((imp.file, imp.spec), []).append(imp.line)
        for file, counter in per_file.items():
            for spec, count in counter.items():
                if count > 1:
                    lines = lines_by_key[(file, spec)]
                    findings.append(ScanFinding(
                        scanner_id=self.scanner_id,
                        category="maintainability",
                        title=f"Duplicate import of '{spec}'",
                        severity="low",
                        confidence=0.9,
                        evidence=f"{file} imports '{spec}' {count} times (lines {lines}).",
                        file_path=file,
                        start_line=min(lines),
                        end_line=max(lines),
                        raw_metadata={"spec": spec, "lines": lines},
                        repairable=True,
                        repair_type="remove_unused_import",
                    ))
        return findings
