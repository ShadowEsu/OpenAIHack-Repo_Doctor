"""Generate the messy demo repository used for demos.

Writes sample-repositories/messy-demo/ at the monorepo root and zips it so it
can be uploaded through the API. The repository intentionally contains a
broken import, duplicate components, a FAKE API key, undocumented environment
variables, an unused dependency, a meaningless test, an incomplete README, an
empty catch block, and an abandoned backup file.

Usage:  python scripts/make_sample_repo.py
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

API_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(API_ROOT))

from tests.conftest import MESSY_FILES  # noqa: E402


def main() -> None:
    monorepo_root = API_ROOT.parents[1]
    target = monorepo_root / "sample-repositories" / "messy-demo"
    if target.exists():
        shutil.rmtree(target)
    for rel, content in MESSY_FILES.items():
        path = target / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
    archive = shutil.make_archive(str(target), "zip", root_dir=target.parent, base_dir="messy-demo")
    print(f"Wrote {target}")
    print(f"Wrote {archive}")


if __name__ == "__main__":
    main()
