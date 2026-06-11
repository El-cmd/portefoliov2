from __future__ import annotations

from functools import lru_cache
from typing import Any

from groq import Groq

from app.core.config import get_settings


@lru_cache(maxsize=1)
def _get_client() -> Groq:
    settings = get_settings()
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured.")
    return Groq(
        api_key=settings.groq_api_key,
        timeout=settings.groq_timeout_seconds,
    )


def generate_answer(system_prompt: str, messages: list[dict[str, Any]]) -> str:
    settings = get_settings()
    client = _get_client()

    request_messages = [{"role": "system", "content": system_prompt}, *messages]
    response = client.chat.completions.create(
        model=settings.groq_model,
        temperature=settings.groq_temperature,
        messages=request_messages,
    )

    content = response.choices[0].message.content if response.choices else ""
    return (content or "").strip()
