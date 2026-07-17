from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./data/repo_doctor.db"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    workspace_root: str = "./data/workspaces"
    max_upload_size_mb: int = 100
    max_extracted_size_mb: int = 300
    max_file_count: int = 20000
    clone_timeout_seconds: int = 120
    command_timeout_seconds: int = 180
    allow_dependency_install: bool = False
    cors_origins: str = "http://localhost:3000"

    @property
    def workspace_path(self) -> Path:
        p = Path(self.workspace_root).resolve()
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
