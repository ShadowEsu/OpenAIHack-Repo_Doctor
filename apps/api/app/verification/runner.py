"""Verification runner with a strict command allowlist.

Only well-known package scripts and interpreters are executed, always inside
the isolated working copy, with timeouts and truncated output capture.
Checks that cannot run are reported as 'skipped' with an honest reason —
never as passed.
"""
from __future__ import annotations

import ast
import json
import shutil
import subprocess
from dataclasses import dataclass, field
from pathlib import Path

from app.core.config import get_settings

MAX_OUTPUT = 20_000

ALLOWED_EXECUTABLES = {"npm", "pnpm", "yarn", "bun", "npx", "node", "python", "python3", "pytest"}


@dataclass
class CheckResult:
    status: str = "skipped"  # passed | failed | skipped
    output: str = ""


@dataclass
class VerificationResult:
    syntax: CheckResult = field(default_factory=CheckResult)
    lint: CheckResult = field(default_factory=CheckResult)
    typecheck: CheckResult = field(default_factory=CheckResult)
    tests: CheckResult = field(default_factory=CheckResult)
    build: CheckResult = field(default_factory=CheckResult)
    notes: list[str] = field(default_factory=list)


def _run(cmd: list[str], cwd: Path) -> CheckResult:
    settings = get_settings()
    if cmd[0] not in ALLOWED_EXECUTABLES:
        return CheckResult("skipped", f"Command '{cmd[0]}' is not on the allowlist.")
    if shutil.which(cmd[0]) is None:
        return CheckResult("skipped", f"'{cmd[0]}' is not installed on the analysis host.")
    try:
        proc = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            timeout=settings.command_timeout_seconds,
            env={
                "PATH": "/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin",
                "CI": "1",
                "NODE_ENV": "test",
                "HOME": str(cwd),
            },
        )
    except subprocess.TimeoutExpired:
        return CheckResult("failed", f"Timed out after {settings.command_timeout_seconds}s: {' '.join(cmd)}")
    output = (proc.stdout + b"\n" + proc.stderr).decode(errors="replace")[:MAX_OUTPUT]
    return CheckResult("passed" if proc.returncode == 0 else "failed", output)


def _check_python_syntax(working_copy: Path, changed_files: list[str]) -> CheckResult:
    """Syntax-check changed Python files with ast (no execution)."""
    checked = 0
    errors: list[str] = []
    for rel in changed_files:
        if not rel.endswith(".py"):
            continue
        path = working_copy / rel
        if not path.exists():
            continue
        checked += 1
        try:
            ast.parse(path.read_text(encoding="utf-8", errors="replace"))
        except SyntaxError as exc:
            errors.append(f"{rel}: {exc}")
    if checked == 0:
        return CheckResult("skipped", "No changed Python files to syntax-check.")
    if errors:
        return CheckResult("failed", "\n".join(errors))
    return CheckResult("passed", f"{checked} changed Python file(s) parse cleanly.")


def _check_js_syntax(working_copy: Path, changed_files: list[str]) -> CheckResult:
    js_files = [f for f in changed_files if f.endswith((".js", ".mjs", ".cjs"))]
    if not js_files:
        return CheckResult("skipped", "No changed plain-JavaScript files to syntax-check "
                                      "(TypeScript/JSX requires the repository's own tooling).")
    if shutil.which("node") is None:
        return CheckResult("skipped", "node is not installed on the analysis host.")
    errors = []
    for rel in js_files:
        result = _run(["node", "--check", rel], working_copy)
        if result.status == "failed":
            errors.append(f"{rel}: {result.output[:500]}")
    if errors:
        return CheckResult("failed", "\n".join(errors))
    return CheckResult("passed", f"{len(js_files)} changed JavaScript file(s) parse cleanly.")


def run_verification(working_copy: Path, changed_files: list[str]) -> VerificationResult:
    result = VerificationResult()
    settings = get_settings()

    # 1) Syntax (always attempted, no dependencies needed)
    py = _check_python_syntax(working_copy, changed_files)
    js = _check_js_syntax(working_copy, changed_files)
    picked = py if py.status != "skipped" else js
    if py.status != "skipped" and js.status != "skipped":
        picked = CheckResult(
            "failed" if "failed" in (py.status, js.status) else "passed",
            f"Python: {py.output}\nJavaScript: {js.output}",
        )
    result.syntax = picked
    if py.status == "skipped" and js.status == "skipped":
        result.syntax = CheckResult("skipped", "No syntax-checkable source files were changed "
                                               "(documentation or config only).")

    # 2) Package scripts (JS ecosystems)
    pkg_path = working_copy / "package.json"
    scripts: dict[str, str] = {}
    if pkg_path.exists():
        try:
            scripts = json.loads(pkg_path.read_text(encoding="utf-8", errors="replace")).get("scripts", {})
        except json.JSONDecodeError:
            result.notes.append("package.json could not be parsed; npm scripts were skipped.")

    node_modules_present = (working_copy / "node_modules").exists()
    if scripts and not node_modules_present:
        if settings.allow_dependency_install:
            install = _run(["npm", "install", "--no-audit", "--no-fund", "--ignore-scripts"], working_copy)
            if install.status != "passed":
                result.notes.append("Dependency installation failed; lint/test/build were skipped. "
                                    f"Output: {install.output[:1000]}")
            else:
                node_modules_present = True
        else:
            result.notes.append(
                "node_modules is not present and dependency installation is disabled "
                "(ALLOW_DEPENDENCY_INSTALL=false), so npm lint/test/build were skipped. "
                "This repair is verified by syntax checks only."
            )

    if scripts and node_modules_present:
        if "lint" in scripts:
            result.lint = _run(["npm", "run", "lint", "--silent"], working_copy)
        if "typecheck" in scripts:
            result.typecheck = _run(["npm", "run", "typecheck", "--silent"], working_copy)
        elif "type-check" in scripts:
            result.typecheck = _run(["npm", "run", "type-check", "--silent"], working_copy)
        if "test" in scripts:
            result.tests = _run(["npm", "test", "--silent", "--", "--run"], working_copy)
        if "build" in scripts:
            result.build = _run(["npm", "run", "build", "--silent"], working_copy)

    # 3) Python tests
    has_py_tests = any(working_copy.rglob("test_*.py")) or any(working_copy.rglob("*_test.py"))
    if has_py_tests and result.tests.status == "skipped":
        if shutil.which("pytest"):
            result.tests = _run(["pytest", "-x", "-q", "--no-header"], working_copy)
        else:
            result.notes.append("Python test files exist but pytest is not installed on the host; "
                                "tests were skipped.")

    if result.tests.status == "skipped" and not has_py_tests and not scripts.get("test"):
        result.notes.append("The repository declares no test command, so the repair cannot be "
                            "verified against a test suite.")
    return result
