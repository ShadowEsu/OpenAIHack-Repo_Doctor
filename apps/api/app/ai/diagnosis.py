"""AI diagnosis layer.

Deterministic findings are sanitized and sent to OpenAI, which groups them
into diagnoses, explains why they matter, and assigns repair risk. Responses
are strictly validated; malformed responses or unknown file paths are
rejected. When no API key is configured (or the call fails), a rule-based
fallback produces honest template diagnoses, and the examination records
which engine produced them.
"""
from __future__ import annotations

import json
import logging
from typing import Optional

from pydantic import BaseModel, Field, ValidationError

from app.core.config import get_settings
from app.models import Finding

logger = logging.getLogger(__name__)

VALID_SEVERITIES = {"critical", "high", "medium", "low", "info"}
VALID_RISKS = {"low", "medium", "high"}
VALID_EFFORTS = {"small", "medium", "large"}


class AIAffectedFile(BaseModel):
    path: str
    start_line: Optional[int] = None
    end_line: Optional[int] = None


class AIDiagnosis(BaseModel):
    title: str = Field(max_length=255)
    category: str
    severity: str
    confidence: float = Field(ge=0.0, le=1.0)
    finding_ids: list[str] = []
    affected_files: list[AIAffectedFile] = []
    explanation: str
    why_it_matters: str
    recommended_action: str
    repairable: bool = False
    repair_type: Optional[str] = None
    repair_risk: Optional[str] = None
    repair_effort: Optional[str] = None
    uncertainty: Optional[str] = None


class AIDiagnosisResponse(BaseModel):
    diagnoses: list[AIDiagnosis]


SYSTEM_PROMPT = """You are the diagnosis engine of Repo Doctor, acting as a careful senior engineer.
You receive deterministic scanner findings from a repository examination. Your job:
- Merge duplicate/related findings into coherent diagnoses
- Explain each issue plainly (understandable to a junior developer, no unexplained jargon)
- Explain why it matters, without exaggeration
- State uncertainty honestly when confidence is limited
- Assign repair risk (low/medium/high) and effort (small/medium/large)
- Keep the repairable flag and repair_type from the findings when they exist; never invent new repair types
Rules you must follow:
- Never invent files, findings, or vulnerabilities not present in the input
- Never claim a command was run or a test passed
- Only reference file paths that appear in the findings
- Respond with strict JSON matching the requested schema, nothing else
"""


def sanitize_findings(findings: list[Finding]) -> list[dict]:
    """Prepare findings for the AI. Secret evidence is stripped for unsafe findings."""
    payload = []
    for f in findings:
        item = {
            "finding_id": f.id,
            "scanner_id": f.scanner_id,
            "category": f.category,
            "title": f.title,
            "severity": f.severity,
            "confidence": f.confidence,
            "file_path": f.file_path,
            "start_line": f.start_line,
            "end_line": f.end_line,
            "repairable": f.repairable,
            "repair_type": f.repair_type,
        }
        if f.safe_for_ai:
            item["evidence"] = f.evidence
        else:
            item["evidence"] = "(evidence withheld: contains a detected credential)"
        payload.append(item)
    return payload


def _validate_response(raw: str, findings: list[Finding]) -> list[AIDiagnosis]:
    parsed = AIDiagnosisResponse.model_validate(json.loads(raw))
    known_ids = {f.id for f in findings}
    known_paths = {f.file_path for f in findings if f.file_path}
    valid: list[AIDiagnosis] = []
    for diag in parsed.diagnoses:
        diag.finding_ids = [fid for fid in diag.finding_ids if fid in known_ids]
        diag.affected_files = [af for af in diag.affected_files if af.path in known_paths]
        if diag.severity not in VALID_SEVERITIES:
            diag.severity = "medium"
        if diag.repair_risk and diag.repair_risk not in VALID_RISKS:
            diag.repair_risk = "medium"
        if diag.repair_effort and diag.repair_effort not in VALID_EFFORTS:
            diag.repair_effort = "medium"
        # a diagnosis is only repairable if a linked finding actually is
        linked = [f for f in findings if f.id in diag.finding_ids]
        repairable_types = {f.repair_type for f in linked if f.repairable and f.repair_type}
        if diag.repairable and not repairable_types:
            diag.repairable = False
            diag.repair_type = None
        elif repairable_types:
            diag.repairable = True
            if diag.repair_type not in repairable_types:
                diag.repair_type = next(iter(repairable_types))
        valid.append(diag)
    return valid


def generate_diagnoses(findings: list[Finding], repo_metadata: dict) -> tuple[list[AIDiagnosis], str]:
    """Returns (diagnoses, engine) where engine is 'openai:<model>' or 'rule-based'."""
    settings = get_settings()
    if settings.openai_api_key and findings:
        try:
            return _openai_diagnoses(findings, repo_metadata), f"openai:{settings.openai_model}"
        except Exception:  # noqa: BLE001 - fall back but log the real error
            logger.exception("OpenAI diagnosis failed; falling back to rule-based grouping")
    return _rule_based_diagnoses(findings), "rule-based"


def _openai_diagnoses(findings: list[Finding], repo_metadata: dict) -> list[AIDiagnosis]:
    from openai import OpenAI

    settings = get_settings()
    client = OpenAI(api_key=settings.openai_api_key)
    user_payload = {
        "repository": repo_metadata,
        "findings": sanitize_findings(findings),
        "response_schema": {
            "diagnoses": [{
                "title": "string", "category": "string",
                "severity": "critical|high|medium|low|info",
                "confidence": "number 0-1",
                "finding_ids": ["finding_id values from input"],
                "affected_files": [{"path": "string", "start_line": "int|null", "end_line": "int|null"}],
                "explanation": "string", "why_it_matters": "string",
                "recommended_action": "string",
                "repairable": "boolean", "repair_type": "string|null",
                "repair_risk": "low|medium|high", "repair_effort": "small|medium|large",
                "uncertainty": "string|null",
            }]
        },
    }
    response = client.chat.completions.create(
        model=settings.openai_model,
        response_format={"type": "json_object"},
        temperature=0.2,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(user_payload)},
        ],
        timeout=90,
    )
    raw = response.choices[0].message.content or "{}"
    try:
        return _validate_response(raw, findings)
    except (ValidationError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"AI returned an invalid diagnosis payload: {exc}") from exc


# ---------------------------------------------------------------------------
# Rule-based fallback: honest template grouping by scanner
# ---------------------------------------------------------------------------

_WHY_IT_MATTERS = {
    "hardcoded_secret": "Credentials committed to a repository can be extracted by anyone with "
                        "read access, including through version history, and abused.",
    "env_committed": "A committed .env file exposes real configuration values to anyone who can "
                     "read the repository.",
    "broken_imports": "Broken imports cause runtime crashes or build failures, often only "
                      "discovered after deployment.",
    "dead_files": "Dead files mislead contributors, inflate review effort, and hide which code "
                  "actually runs.",
    "duplicate_code": "Duplicated logic drifts apart over time; bug fixes applied to one copy "
                      "silently miss the others.",
    "giant_files": "Very large files concentrate many responsibilities, making changes riskier "
                   "and reviews slower.",
    "env_variables": "Undocumented environment variables prevent new contributors from running "
                     "the project and cause misconfigured deployments.",
    "unused_dependencies": "Unused dependencies enlarge installs, widen the attack surface, and "
                           "add upgrade burden for no benefit.",
    "weak_tests": "Weak or missing tests mean regressions ship undetected; refactoring becomes "
                  "risky guesswork.",
    "documentation": "Without accurate setup documentation, every new contributor loses time "
                     "rediscovering how to install and run the project.",
    "error_handling": "Swallowed errors hide real failures from users and logs, making outages "
                      "hard to diagnose.",
}

_SEVERITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}


def _rule_based_diagnoses(findings: list[Finding]) -> list[AIDiagnosis]:
    groups: dict[str, list[Finding]] = {}
    for f in findings:
        groups.setdefault(f.scanner_id, []).append(f)

    diagnoses: list[AIDiagnosis] = []
    for scanner_id, group in groups.items():
        group.sort(key=lambda f: (_SEVERITY_ORDER.get(f.severity, 5), -f.confidence))
        top = group[0]
        count = len(group)
        title = top.title if count == 1 else f"{top.title} (+{count - 1} related finding(s))"
        affected = []
        seen_paths = set()
        for f in group:
            if f.file_path and f.file_path not in seen_paths:
                seen_paths.add(f.file_path)
                affected.append(AIAffectedFile(path=f.file_path, start_line=f.start_line, end_line=f.end_line))
        repairable = any(f.repairable for f in group)
        repair_type = next((f.repair_type for f in group if f.repairable and f.repair_type), None)
        diagnoses.append(AIDiagnosis(
            title=title,
            category=top.category,
            severity=top.severity,
            confidence=round(sum(f.confidence for f in group) / count, 2),
            finding_ids=[f.id for f in group],
            affected_files=affected[:20],
            explanation=(
                f"The {scanner_id.replace('_', ' ')} scanner reported {count} finding(s). "
                f"Most significant: {top.evidence or top.title}"
            ),
            why_it_matters=_WHY_IT_MATTERS.get(scanner_id, "This issue reduces the maintainability "
                                                           "and reliability of the repository."),
            recommended_action=_recommended_action(scanner_id, repair_type),
            repairable=repairable,
            repair_type=repair_type,
            repair_risk="low" if repair_type in ("create_env_example", "remove_unused_import") else "medium",
            repair_effort="small" if count <= 3 else "medium",
            uncertainty=("Generated by deterministic rules without AI review; explanations are "
                         "template-based."),
        ))
    diagnoses.sort(key=lambda d: (_SEVERITY_ORDER.get(d.severity, 5), -d.confidence))
    return diagnoses


def _recommended_action(scanner_id: str, repair_type: str | None) -> str:
    actions = {
        "hardcoded_secret": "Move each credential into an environment variable, rotate the exposed "
                            "value, and add the variable to .env.example with a placeholder.",
        "env_committed": "Remove .env from version control, add it to .gitignore, and rotate any "
                         "values it contained.",
        "broken_imports": "Fix or remove each import that points to a missing file, and declare "
                          "missing packages in the dependency manifest.",
        "dead_files": "Review each file and delete it if it is truly unused.",
        "duplicate_code": "Consolidate the duplicated logic into a single shared module.",
        "giant_files": "Split the file into smaller modules, separating UI, data access, and "
                       "business logic.",
        "env_variables": "Create or update .env.example so every referenced variable is documented "
                         "with a safe placeholder.",
        "unused_dependencies": "Confirm each dependency is unused, then remove it from the manifest.",
        "weak_tests": "Add meaningful assertions that exercise application code, and unskip or "
                      "remove placeholder tests.",
        "documentation": "Update the README with verified install, run, and test commands.",
        "error_handling": "Log or surface caught errors, and add error states for network requests.",
    }
    return actions.get(scanner_id, "Review the findings and apply the appropriate fix.")
