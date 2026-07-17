from __future__ import annotations

import os
import sys
from pathlib import Path

import pytest

API_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(API_ROOT))


@pytest.fixture(scope="session", autouse=True)
def _test_settings(tmp_path_factory):
    data_dir = tmp_path_factory.mktemp("repo-doctor-data")
    os.environ["DATABASE_URL"] = f"sqlite:///{data_dir}/test.db"
    os.environ["WORKSPACE_ROOT"] = str(data_dir / "workspaces")
    os.environ["OPENAI_API_KEY"] = ""  # force the rule-based fallback in tests
    os.environ["ALLOW_DEPENDENCY_INSTALL"] = "false"
    from app.core.config import get_settings

    get_settings.cache_clear()
    yield


MESSY_FILES: dict[str, str] = {
    "package.json": """{
  "name": "messy-demo",
  "version": "1.0.0",
  "scripts": {"dev": "next dev", "test": "vitest run", "build": "next build"},
  "dependencies": {
    "react": "^18.0.0",
    "next": "^14.0.0",
    "moment": "^2.29.0"
  },
  "devDependencies": {"vitest": "^1.0.0", "typescript": "^5.0.0"}
}
""",
    "README.md": "# messy-demo\n\nComing soon\n",
    "src/index.ts": (
        "import { Button } from './components/Button'\n"
        "import { helper } from './utils/helper'\n"
        "import { helper } from './utils/helper'\n"
        "import { ghost } from './utils/missing-file'\n"
        "console.log(Button, helper, ghost)\n"
    ),
    "src/components/Button.tsx": (
        "import React from 'react'\n"
        "\n"
        "interface ButtonProps {\n"
        "  label: string\n"
        "  variant?: 'primary' | 'secondary'\n"
        "  disabled?: boolean\n"
        "  onClick?: () => void\n"
        "}\n"
        "\n"
        "export function Button({ label, variant = 'primary', disabled, onClick }: ButtonProps) {\n"
        "  const apiKey = 'sk-proj-Zz9Xy8Ww7Vv6Uu5Tt4Ss3Rr2Qq1Pp0Oo'\n"
        "  const className = variant === 'primary' ? 'btn btn-primary' : 'btn btn-secondary'\n"
        "  return (\n"
        "    <button className={className} disabled={disabled} onClick={onClick} data-key={apiKey}>\n"
        "      {label}\n"
        "    </button>\n"
        "  )\n"
        "}\n"
    ),
    "src/components/ButtonCopy.tsx": (
        "import React from 'react'\n"
        "\n"
        "interface ButtonProps {\n"
        "  label: string\n"
        "  variant?: 'primary' | 'secondary'\n"
        "  disabled?: boolean\n"
        "  onClick?: () => void\n"
        "}\n"
        "\n"
        "export function Button({ label, variant = 'primary', disabled, onClick }: ButtonProps) {\n"
        "  const apiKey = 'sk-proj-Zz9Xy8Ww7Vv6Uu5Tt4Ss3Rr2Qq1Pp0Oo'\n"
        "  const className = variant === 'primary' ? 'btn btn-primary' : 'btn btn-secondary'\n"
        "  return (\n"
        "    <button className={className} disabled={disabled} onClick={onClick} data-key={apiKey}>\n"
        "      {label}\n"
        "    </button>\n"
        "  )\n"
        "}\n"
    ),
    "src/utils/helper.ts": (
        "export function helper(value: string) {\n"
        "  const url = process.env.API_BASE_URL\n"
        "  const secret = process.env.SERVICE_SECRET\n"
        "  const region = process.env.DEPLOY_REGION\n"
        "  try {\n"
        "    return fetch(url + value + secret + region)\n"
        "  } catch (e) {}\n"
        "}\n"
    ),
    "src/utils/old_helper_backup.ts": (
        "export function oldHelper(value: string) {\n"
        "  return value.trim()\n"
        "}\n"
    ),
    "src/__tests__/app.test.ts": (
        "import { it, expect } from 'vitest'\n"
        "it('works', () => {\n"
        "  expect(true).toBe(true)\n"
        "})\n"
    ),
}


@pytest.fixture
def messy_repo(tmp_path) -> Path:
    root = tmp_path / "messy-demo"
    for rel, content in MESSY_FILES.items():
        path = root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
    return root
