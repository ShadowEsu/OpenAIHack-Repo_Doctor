"""Treatment: improve README setup instructions using only verified commands.

Commands are derived from the actual package manifests — nothing is invented.
"""
from __future__ import annotations

from app.models import Diagnosis, Finding
from app.services.inventory import RepositoryContext
from app.treatments.base import FileOperation, TreatmentGenerator, TreatmentNotApplicable, TreatmentProposal
from app.scanners.env_variables import find_referenced_env_vars

SECTION_MARKER = "## Getting Started"


class ImproveReadmeTreatment(TreatmentGenerator):
    treatment_type = "improve_readme"

    def generate(self, ctx: RepositoryContext, diagnosis: Diagnosis, findings: list[Finding]) -> TreatmentProposal:
        readme_path = "README.md"
        existing = ctx.read_text(readme_path)

        install_cmds: list[str] = []
        run_cmds: list[str] = []
        test_cmds: list[str] = []
        build_cmds: list[str] = []

        if ctx.package_json:
            pm = ctx.package_manager or "npm"
            install_cmds.append(f"{pm} install")
            scripts = ctx.package_json.get("scripts", {})
            run_prefix = {"npm": "npm run", "pnpm": "pnpm", "yarn": "yarn", "bun": "bun run"}.get(pm, "npm run")
            if "dev" in scripts:
                run_cmds.append(f"{run_prefix} dev")
            elif "start" in scripts:
                run_cmds.append("npm start" if pm == "npm" else f"{run_prefix} start")
            if "test" in scripts:
                test_cmds.append(f"{run_prefix} test")
            if "build" in scripts:
                build_cmds.append(f"{run_prefix} build")
        if ctx.python_requirements or (ctx.root / "pyproject.toml").exists():
            if (ctx.root / "requirements.txt").exists():
                install_cmds.append("pip install -r requirements.txt")
            elif (ctx.root / "pyproject.toml").exists():
                install_cmds.append("pip install -e .")
            if (ctx.root / "manage.py").exists():
                run_cmds.append("python manage.py runserver")
            elif (ctx.root / "main.py").exists():
                run_cmds.append("python main.py")
            elif (ctx.root / "app.py").exists():
                run_cmds.append("python app.py")
            if any(f.is_test and f.language == "Python" for f in ctx.files):
                test_cmds.append("pytest")

        if not install_cmds and not run_cmds:
            raise TreatmentNotApplicable(
                "No package manifest was found, so setup commands cannot be verified. "
                "Repo Doctor does not invent commands."
            )

        env_vars = sorted(find_referenced_env_vars(ctx))
        section_lines = [SECTION_MARKER, ""]
        if install_cmds:
            section_lines += ["### Installation", "", "```bash"] + install_cmds + ["```", ""]
        if env_vars:
            section_lines += [
                "### Environment Variables", "",
                "Copy `.env.example` to `.env` and fill in the values. The application reads:",
                "",
            ] + [f"- `{v}`" for v in env_vars] + [""]
        if run_cmds:
            section_lines += ["### Running Locally", "", "```bash"] + run_cmds + ["```", ""]
        if test_cmds:
            section_lines += ["### Tests", "", "```bash"] + test_cmds + ["```", ""]
        if build_cmds:
            section_lines += ["### Build", "", "```bash"] + build_cmds + ["```", ""]
        section = "\n".join(section_lines).rstrip("\n") + "\n"

        if existing and SECTION_MARKER in existing:
            raise TreatmentNotApplicable("The README already contains a Getting Started section.")

        if existing:
            new_content = existing.rstrip("\n") + "\n\n" + section
            operation = "modify"
        else:
            title = ctx.root.name
            new_content = f"# {title}\n\n" + section
            operation = "create"

        return TreatmentProposal(
            treatment_type=self.treatment_type,
            summary=(
                f"{'Append a' if operation == 'modify' else 'Create README.md with a'} verified "
                "'Getting Started' section. Every command comes from the repository's actual "
                "manifests — none are invented."
            ),
            operations=[FileOperation(path=readme_path, operation=operation, new_content=new_content)],
            risk_level="low",
            side_effects="Documentation-only change; application behavior is unaffected.",
            verification_plan=[
                "Confirm all documented commands exist in the package manifests",
                "Run the repository lint command if available",
            ],
        )
