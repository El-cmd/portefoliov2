from __future__ import annotations

import re
from math import isfinite
from dataclasses import dataclass
from functools import lru_cache

from groq import Groq, RateLimitError

from app.core.config import get_settings

LABEL_PATTERN = re.compile(r"\b(BENIGN|MALICIOUS)\b", re.IGNORECASE)


class PromptGuardUnavailableError(RuntimeError):
    """Raised when no prompt guard model can safely classify a message."""


@dataclass(frozen=True)
class PromptGuardResult:
    is_malicious: bool
    model: str
    used_fallback: bool = False


@lru_cache(maxsize=1)
def _get_client() -> Groq:
    settings = get_settings()
    if not settings.groq_api_key:
        raise PromptGuardUnavailableError("Groq API key is not configured.")

    return Groq(
        api_key=settings.groq_api_key,
        timeout=settings.prompt_guard_timeout_seconds,
        max_retries=0,
    )


def _parse_guard_output(content: str, threshold: float) -> bool:
    match = LABEL_PATTERN.search(content)
    if match:
        return match.group(1).upper() == "MALICIOUS"

    try:
        score = float(content.strip())
    except ValueError as exc:
        raise PromptGuardUnavailableError(
            "Prompt guard returned an unknown result."
        ) from exc

    if not isfinite(score) or not 0 <= score <= 1:
        raise PromptGuardUnavailableError("Prompt guard returned an invalid score.")

    return score >= threshold


def _classify_prompt(
    client: Groq,
    model: str,
    message: str,
    threshold: float,
) -> bool:
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": message}],
    )
    content = response.choices[0].message.content if response.choices else ""
    return _parse_guard_output(content or "", threshold)


def check_prompt(message: str) -> PromptGuardResult:
    settings = get_settings()
    if not settings.prompt_guard_enabled:
        return PromptGuardResult(is_malicious=False, model="disabled")

    client = _get_client()

    try:
        is_malicious = _classify_prompt(
            client,
            settings.prompt_guard_primary_model,
            message,
            settings.prompt_guard_malicious_threshold,
        )
        return PromptGuardResult(
            is_malicious=is_malicious,
            model=settings.prompt_guard_primary_model,
        )
    except RateLimitError:
        pass
    except PromptGuardUnavailableError:
        raise
    except Exception as exc:
        raise PromptGuardUnavailableError("Primary prompt guard request failed.") from exc

    try:
        is_malicious = _classify_prompt(
            client,
            settings.prompt_guard_fallback_model,
            message,
            settings.prompt_guard_malicious_threshold,
        )
        return PromptGuardResult(
            is_malicious=is_malicious,
            model=settings.prompt_guard_fallback_model,
            used_fallback=True,
        )
    except RateLimitError as exc:
        raise PromptGuardUnavailableError(
            "Prompt guard rate limits are exhausted."
        ) from exc
    except PromptGuardUnavailableError:
        raise
    except Exception as exc:
        raise PromptGuardUnavailableError("Fallback prompt guard request failed.") from exc
