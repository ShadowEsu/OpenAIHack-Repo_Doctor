"""Treatment: create or update .env.example with referenced environment variables.

Secret values are never copied; every variable gets an empty placeholder.
Existing documentation lines are preserved.
"""
from __future__ import annotations

from app.models import Diagnosis, Finding
from app.scanners.env_variables import ENV_FILE_VAR_RE, find_referenced_env_vars
from app.services.inventory import RepositoryContext
from app.treatments.base import FileOperation, TreatmentGenerator, TreatmentNotApplicable, TreatmentProposal

COMMENT_HINTS = {
    "KEY": "API key (server-side only; never commit the real value)",
    "TOKEN": "Access token (never commit the real value)",
    "SECRET": "Secret value (never commit the real value)",
    "URL": "Service URL",
    "DATABASE": "Database connection string",
    "DB": "Database connection string",
    "PORT": "Port number",
}


def _comment_for(var: str) -> str:
    for hint, comment in COMMENT_HINTS.items():
        if hint in var.upper():
            return comment
    return "Required by the application"


class EnvExampleTreatment(TreatmentGenerator):
    treatment_type = "create_env_example"

    def generate(self, ctx: RepositoryContext, diagnosis: Diagnosis, findings: list[Finding]) -> TreatmentProposal:
        referenced = find_referenced_env_vars(ctx)
        # variables from .env that should be documented (names only, never values)
        env_text = ctx.read_text(".env")
        env_var_names = set(ENV_FILE_VAR_RE.findall(env_text)) if env_text else set()
        all_vars = sorted(set(referenced) | env_var_names)
        if not all_vars:
            raise TreatmentNotApplicable("No referenced environment variables were found.")

        existing_text = ctx.read_text(".env.example") or ""
        existing_vars = set(ENV_FILE_VAR_RE.findall(existing_text))
        missing = [v for v in all_vars if v not in existing_vars]
        if not missing:
            raise TreatmentNotApplicable("Every referenced variable is already documented in .env.example.")

        lines: list[str] = []
        if existing_text.strip():
            lines.append(existing_text.rstrip("\n"))
            lines.append("")
        for var in missing:
            lines.append(f"# {_comment_for(var)}")
            if var in referenced:
                file, line_no = referenced[var]
                lines.append(f"# Referenced in {file} line {line_no}")
            lines.append(f"{var}=")
            lines.append("")
        new_content = "\n".join(lines).rstrip("\n") + "\n"

        operation = "modify" if existing_text else "create"
        return TreatmentProposal(
            treatment_type=self.treatment_type,
            summary=(
                f"{'Update' if operation == 'modify' else 'Create'} .env.example to document "
                f"{len(missing)} environment variable(s): {', '.join(missing[:6])}"
                f"{'…' if len(missing) > 6 else ''}. Placeholder values only — no secrets are copied."
            ),
            operations=[FileOperation(path=".env.example", operation=operation, new_content=new_content)],
            risk_level="low",
            side_effects=(
                "A documentation-only change. No application code is modified, so runtime "
                "behavior cannot change."
            ),
            verification_plan=[
                "Confirm no real secret values were copied into .env.example",
                "Run the repository lint command if available",
                "Run the repository test command if available",
            ],
        )
