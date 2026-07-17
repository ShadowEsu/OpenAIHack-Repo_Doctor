"""Build a lightweight import graph for JS/TS and Python files.

The graph supports broken-import detection, dead-file detection, and
unused-dependency detection. It is intentionally conservative: aliased
imports (e.g. `@/components/...`) are resolved against common alias roots,
and anything unresolvable is recorded rather than guessed at.
"""
from __future__ import annotations

import ast
import re
from dataclasses import dataclass, field
from pathlib import Path

from app.services.inventory import RepositoryContext

JS_EXTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]
INDEX_CANDIDATES = [f"/index{ext}" for ext in JS_EXTS]

IMPORT_RE = re.compile(
    r"""(?:import\s+(?:[\w*{}\s,$]+\s+from\s+)?|export\s+(?:[\w*{}\s,$]+\s+from\s+)|require\(\s*|import\(\s*)
        ['"](?P<spec>[^'"]+)['"]""",
    re.VERBOSE,
)

NODE_BUILTINS = {
    "fs", "path", "os", "http", "https", "crypto", "url", "util", "stream", "events",
    "child_process", "assert", "buffer", "querystring", "zlib", "net", "dns", "tls",
    "readline", "worker_threads", "cluster", "process", "console", "timers", "module",
}


@dataclass
class ImportRecord:
    file: str          # importing file (relative path)
    spec: str          # raw import specifier
    line: int
    kind: str          # "local" | "package" | "alias"
    resolved: str | None = None  # relative path of resolved local file, if any


@dataclass
class ImportGraph:
    imports: list[ImportRecord] = field(default_factory=list)
    imported_files: set = field(default_factory=set)     # files imported by someone
    package_imports: dict = field(default_factory=dict)  # package -> [files]
    entry_points: set = field(default_factory=set)


def _js_alias_roots(ctx: RepositoryContext) -> list[str]:
    roots = []
    for candidate in ("src", "app", ""):
        if candidate == "" or (ctx.root / candidate).is_dir():
            roots.append(candidate)
    return roots


def _resolve_js(ctx: RepositoryContext, from_file: str, spec: str) -> str | None:
    if spec.startswith("."):
        base = (Path(from_file).parent / spec)
    elif spec.startswith(("@/", "~/")):
        remainder = spec[2:]
        for root in _js_alias_roots(ctx):
            candidate = _try_js_paths(ctx, str(Path(root) / remainder) if root else remainder)
            if candidate:
                return candidate
        return None
    else:
        return None
    return _try_js_paths(ctx, str(base))


def _try_js_paths(ctx: RepositoryContext, base: str) -> str | None:
    base = str(Path(base).as_posix())
    # normalize ../ segments
    parts: list[str] = []
    for part in base.split("/"):
        if part == "..":
            if parts:
                parts.pop()
        elif part not in (".", ""):
            parts.append(part)
    base = "/".join(parts)
    existing = {f.path for f in ctx.files}
    candidates = [base] + [base + ext for ext in JS_EXTS] + [base + idx for idx in INDEX_CANDIDATES]
    candidates += [base + ".json", base + ".css", base + ".scss", base + ".svg", base + ".png"]
    for cand in candidates:
        if cand in existing:
            return cand
    return None


def _package_name(spec: str) -> str:
    if spec.startswith("@"):
        parts = spec.split("/")
        return "/".join(parts[:2]) if len(parts) >= 2 else spec
    return spec.split("/")[0]


def _resolve_python(ctx: RepositoryContext, from_file: str, module: str, level: int) -> str | None:
    existing = {f.path for f in ctx.files}
    if level > 0:  # relative import
        base_parts = list(Path(from_file).parent.parts)
        for _ in range(level - 1):
            if base_parts:
                base_parts.pop()
        mod_parts = module.split(".") if module else []
        base = "/".join(base_parts + mod_parts)
    else:
        base = module.replace(".", "/")
    for cand in (f"{base}.py", f"{base}/__init__.py", f"src/{base}.py", f"src/{base}/__init__.py"):
        if cand in existing:
            return cand
    return None


def build_import_graph(ctx: RepositoryContext) -> ImportGraph:
    graph = ImportGraph()

    for record in ctx.source_files():
        text = ctx.read_text(record.path)
        if text is None:
            continue
        if record.extension in JS_EXTS:
            for match in IMPORT_RE.finditer(text):
                spec = match.group("spec")
                line = text.count("\n", 0, match.start()) + 1
                if spec.startswith((".", "@/", "~/")):
                    resolved = _resolve_js(ctx, record.path, spec)
                    kind = "alias" if spec.startswith(("@/", "~/")) else "local"
                    graph.imports.append(ImportRecord(record.path, spec, line, kind, resolved))
                    if resolved:
                        graph.imported_files.add(resolved)
                else:
                    pkg = _package_name(spec.removeprefix("node:"))
                    if pkg in NODE_BUILTINS:
                        continue
                    graph.imports.append(ImportRecord(record.path, spec, line, "package", None))
                    graph.package_imports.setdefault(pkg, []).append(record.path)
        elif record.extension == ".py":
            try:
                tree = ast.parse(text)
            except SyntaxError:
                continue
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        resolved = _resolve_python(ctx, record.path, alias.name, 0)
                        kind = "local" if resolved else "package"
                        rec = ImportRecord(record.path, alias.name, node.lineno, kind, resolved)
                        graph.imports.append(rec)
                        if resolved:
                            graph.imported_files.add(resolved)
                        else:
                            pkg = alias.name.split(".")[0]
                            graph.package_imports.setdefault(pkg, []).append(record.path)
                elif isinstance(node, ast.ImportFrom):
                    module = node.module or ""
                    resolved = _resolve_python(ctx, record.path, module, node.level)
                    kind = "local" if resolved or node.level > 0 else "package"
                    rec = ImportRecord(record.path, ("." * node.level) + module, node.lineno, kind, resolved)
                    graph.imports.append(rec)
                    if resolved:
                        graph.imported_files.add(resolved)
                    elif node.level == 0 and module:
                        pkg = module.split(".")[0]
                        graph.package_imports.setdefault(pkg, []).append(record.path)

    graph.entry_points = _detect_entry_points(ctx)
    ctx.import_graph = {
        "imported_files": graph.imported_files,
        "package_imports": graph.package_imports,
        "entry_points": graph.entry_points,
    }
    return graph


def _detect_entry_points(ctx: RepositoryContext) -> set:
    existing = {f.path for f in ctx.files}
    entries = set()
    if ctx.package_json:
        for key in ("main", "module"):
            value = ctx.package_json.get(key)
            if isinstance(value, str):
                normalized = value.lstrip("./")
                if normalized in existing:
                    entries.add(normalized)
    common = [
        "index.js", "index.ts", "src/index.ts", "src/index.tsx", "src/index.js",
        "src/main.ts", "src/main.tsx", "src/main.jsx", "src/App.tsx", "src/App.jsx",
        "main.py", "app.py", "manage.py", "src/main.py", "app/main.py",
    ]
    entries.update(p for p in common if p in existing)
    # Framework-routed files are implicit entry points (Next.js app/pages, api routes)
    for f in ctx.files:
        parts = f.path.split("/")
        if any(seg in ("pages", "app", "api", "routes", "layouts") for seg in parts[:-1]):
            entries.add(f.path)
    return entries
