"""Detect declared dependencies that are never imported.

Build tools, CLI tools, plugins, type packages, and framework-required
packages are excluded to avoid false positives.
"""
from __future__ import annotations

import re

from app.scanners.base import RepositoryScanner, ScanFinding
from app.services.inventory import RepositoryContext

JS_TOOL_ALLOWLIST_PREFIXES = (
    "@types/", "eslint", "prettier", "typescript", "vite", "webpack", "rollup",
    "babel", "@babel/", "postcss", "autoprefixer", "tailwindcss", "@tailwindcss/",
    "jest", "vitest", "playwright", "@playwright/", "cypress", "husky", "lint-staged",
    "nodemon", "ts-node", "tsx", "turbo", "concurrently", "rimraf", "cross-env",
    "@vitejs/", "@next/", "sharp", "dotenv-cli", "npm-run-all", "@testing-library/",
    "@eslint/", "eslint-", "stylelint", "commitizen", "@commitlint/", "tsup", "swc",
    "@swc/", "esbuild", "serve", "vercel", "wrangler", "drizzle-kit", "prisma",
)

PY_TOOL_ALLOWLIST = {
    "pytest", "black", "flake8", "mypy", "ruff", "isort", "coverage", "tox",
    "pre-commit", "pip", "setuptools", "wheel", "build", "twine", "uvicorn",
    "gunicorn", "python-dotenv", "pytest-asyncio", "pytest-cov", "httpx",
    "python-multipart", "alembic", "psycopg2-binary", "psycopg", "uvloop",
}

# common pip package -> import name differences
PY_IMPORT_ALIASES = {
    "pillow": "PIL", "beautifulsoup4": "bs4", "pyyaml": "yaml", "scikit-learn": "sklearn",
    "opencv-python": "cv2", "python-dateutil": "dateutil", "pydantic-settings": "pydantic_settings",
    "sqlalchemy": "sqlalchemy",
}


class UnusedDependenciesScanner(RepositoryScanner):
    scanner_id = "unused_dependencies"
    category = "dependencies"
    supported_languages = ["JavaScript", "TypeScript", "Python"]

    def scan(self, ctx: RepositoryContext) -> list[ScanFinding]:
        findings: list[ScanFinding] = []
        package_imports = ctx.import_graph.get("package_imports", {})

        if ctx.package_json:
            declared = ctx.package_json.get("dependencies", {})
            scripts_text = " ".join(str(v) for v in ctx.package_json.get("scripts", {}).values())
            for pkg in declared:
                if pkg.startswith(JS_TOOL_ALLOWLIST_PREFIXES) or any(
                    pkg.startswith(p) or pkg == p.rstrip("/-") for p in JS_TOOL_ALLOWLIST_PREFIXES
                ):
                    continue
                if pkg in package_imports:
                    continue
                if pkg in scripts_text:
                    continue  # used as a CLI in npm scripts
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"Dependency '{pkg}' appears unused",
                    severity="low",
                    confidence=0.7,
                    evidence=(
                        f"'{pkg}' is declared in package.json dependencies but no import of it was "
                        "found in source files, and it is not used in npm scripts. It may still be "
                        "loaded dynamically or required by a framework plugin."
                    ),
                    file_path="package.json",
                    raw_metadata={"package": pkg, "ecosystem": "npm"},
                ))

        if ctx.python_requirements:
            imported_modules = set(package_imports)
            for pkg in ctx.python_requirements:
                normalized = pkg.lower()
                if normalized in PY_TOOL_ALLOWLIST:
                    continue
                import_name = PY_IMPORT_ALIASES.get(normalized, normalized.replace("-", "_"))
                if import_name in imported_modules or normalized in imported_modules:
                    continue
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"Python dependency '{pkg}' appears unused",
                    severity="low",
                    confidence=0.6,
                    evidence=(
                        f"'{pkg}' is listed in requirements.txt but no import of "
                        f"'{import_name}' was found. Package/import name mismatches are possible, "
                        "so confidence is limited."
                    ),
                    file_path="requirements.txt",
                    raw_metadata={"package": pkg, "ecosystem": "pip"},
                ))
        return findings
