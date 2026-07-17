from __future__ import annotations

from app.scanners import ALL_SCANNERS
from app.scanners.broken_imports import BrokenImportsScanner
from app.scanners.dead_files import DeadFilesScanner
from app.scanners.documentation import DocumentationScanner
from app.scanners.duplicate_code import DuplicateCodeScanner
from app.scanners.env_variables import EnvVariablesScanner
from app.scanners.error_handling import ErrorHandlingScanner
from app.scanners.secrets import SecretsScanner, mask_secret
from app.scanners.unused_dependencies import UnusedDependenciesScanner
from app.scanners.weak_tests import WeakTestsScanner
from app.services.import_graph import build_import_graph
from app.services.inventory import build_inventory


def _ctx(messy_repo):
    ctx = build_inventory(messy_repo)
    build_import_graph(ctx)
    return ctx


def test_inventory_detects_languages_and_frameworks(messy_repo):
    ctx = build_inventory(messy_repo)
    assert ctx.primary_language == "TypeScript"
    assert "Next.js" in ctx.frameworks
    assert ctx.has_tests
    assert ctx.package_manager == "npm"


def test_broken_imports_finds_missing_file_and_duplicate(messy_repo):
    findings = BrokenImportsScanner().scan(_ctx(messy_repo))
    titles = [f.title for f in findings]
    assert any("missing-file" in t for t in titles)
    assert any("Duplicate import" in t for t in titles)


def test_secrets_scanner_masks_values(messy_repo):
    findings = SecretsScanner().scan(_ctx(messy_repo))
    secret_findings = [f for f in findings if f.scanner_id == "hardcoded_secret"]
    assert secret_findings
    for f in secret_findings:
        assert "sk-proj-Zz9Xy8Ww7Vv6Uu5Tt4Ss3Rr2Qq1Pp0Oo" not in (f.evidence or "")
        assert not f.safe_for_ai
        assert not f.repairable
        assert f.repair_type is None


def test_mask_secret():
    assert mask_secret("sk-proj-abcdefghijklmnop") == "sk-p****mnop"
    assert mask_secret("short") == "****"


def test_env_variables_scanner_finds_undocumented(messy_repo):
    findings = EnvVariablesScanner().scan(_ctx(messy_repo))
    undocumented = [f for f in findings if "undocumented" in f.title]
    assert undocumented
    assert undocumented[0].repair_type == "create_env_example"
    names = str(undocumented[0].raw_metadata)
    assert "API_BASE_URL" in names and "SERVICE_SECRET" in names


def test_duplicate_code_scanner(messy_repo):
    findings = DuplicateCodeScanner().scan(_ctx(messy_repo))
    assert any("Button" in f.title for f in findings)


def test_dead_files_scanner(messy_repo):
    findings = DeadFilesScanner().scan(_ctx(messy_repo))
    assert any("old_helper_backup" in (f.file_path or "") for f in findings)


def test_unused_dependencies_scanner(messy_repo):
    findings = UnusedDependenciesScanner().scan(_ctx(messy_repo))
    packages = [f.raw_metadata.get("package") for f in findings]
    assert "moment" in packages
    assert "react" not in packages  # imported in Button.tsx
    assert "typescript" not in packages  # tool allowlist


def test_weak_tests_scanner(messy_repo):
    findings = WeakTestsScanner().scan(_ctx(messy_repo))
    assert any("Trivial assertion" in f.title for f in findings)


def test_documentation_scanner(messy_repo):
    findings = DocumentationScanner().scan(_ctx(messy_repo))
    titles = " ".join(f.title for f in findings)
    assert "placeholder" in titles or "short" in titles or "installation" in titles


def test_error_handling_scanner(messy_repo):
    findings = ErrorHandlingScanner().scan(_ctx(messy_repo))
    assert any("Empty catch block" in f.title for f in findings)


def test_all_scanners_run_without_crashing(messy_repo):
    ctx = _ctx(messy_repo)
    for scanner_cls in ALL_SCANNERS:
        scanner_cls().scan(ctx)  # must not raise


def test_every_advertised_repair_has_a_treatment_generator(messy_repo):
    from app.treatments import TREATMENT_GENERATORS

    ctx = _ctx(messy_repo)
    findings = [finding for scanner_cls in ALL_SCANNERS for finding in scanner_cls().scan(ctx)]
    advertised = {finding.repair_type for finding in findings if finding.repairable}
    assert None not in advertised
    assert advertised <= set(TREATMENT_GENERATORS)
