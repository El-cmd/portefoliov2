from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    groq_api_key: str | None = Field(default=None, alias="GROQ_API_KEY")
    groq_model: str = Field(default="llama-3.1-8b-instant", alias="GROQ_MODEL")
    groq_temperature: float = Field(default=0.2, alias="GROQ_TEMPERATURE")
    groq_timeout_seconds: float = Field(
        default=25.0,
        gt=0,
        le=120,
        alias="GROQ_TIMEOUT_SECONDS",
    )
    groq_max_concurrent_requests: int = Field(
        default=2,
        ge=1,
        le=20,
        alias="GROQ_MAX_CONCURRENT_REQUESTS",
    )
    groq_queue_timeout_seconds: float = Field(
        default=5.0,
        gt=0,
        le=60,
        alias="GROQ_QUEUE_TIMEOUT_SECONDS",
    )
    prompt_guard_enabled: bool = Field(default=True, alias="PROMPT_GUARD_ENABLED")
    prompt_guard_primary_model: str = Field(
        default="meta-llama/llama-prompt-guard-2-86m",
        alias="PROMPT_GUARD_PRIMARY_MODEL",
    )
    prompt_guard_fallback_model: str = Field(
        default="meta-llama/llama-prompt-guard-2-22m",
        alias="PROMPT_GUARD_FALLBACK_MODEL",
    )
    prompt_guard_timeout_seconds: float = Field(
        default=3.0,
        gt=0,
        le=30,
        alias="PROMPT_GUARD_TIMEOUT_SECONDS",
    )
    prompt_guard_malicious_threshold: float = Field(
        default=0.5,
        ge=0,
        le=1,
        alias="PROMPT_GUARD_MALICIOUS_THRESHOLD",
    )
    embedding_model: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2",
        alias="EMBEDDING_MODEL",
    )
    kb_dir: str | None = Field(default=None, alias="KB_DIR")
    kb_index_path: str | None = Field(default=None, alias="KB_INDEX_PATH")
    kb_meta_path: str | None = Field(default=None, alias="KB_META_PATH")
    kb_top_k: int = Field(default=4, alias="KB_TOP_K")
    kb_min_score: float = Field(default=0.0, alias="KB_MIN_SCORE")

    model_config = SettingsConfigDict(case_sensitive=False)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
