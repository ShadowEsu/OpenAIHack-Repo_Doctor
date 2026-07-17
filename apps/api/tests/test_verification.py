from __future__ import annotations

from app.verification import runner


def test_npm_test_runs_declared_script_without_runner_specific_flags(tmp_path, monkeypatch):
    (tmp_path / "package.json").write_text(
        '{"scripts":{"test":"jest"}}',
        encoding="utf-8",
    )
    (tmp_path / "node_modules").mkdir()
    commands: list[list[str]] = []

    def fake_run(command: list[str], cwd):
        commands.append(command)
        return runner.CheckResult("passed", "ok")

    monkeypatch.setattr(runner, "_run", fake_run)

    result = runner.run_verification(tmp_path, [])

    assert result.tests.status == "passed"
    assert ["npm", "test", "--silent"] in commands
    assert all("--run" not in command for command in commands)
