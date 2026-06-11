from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml


PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "system.yaml"
REQUIRED_FIELDS = ("assistant", "rules")


def _validate_prompt(data: dict[str, Any]) -> tuple[str, list[str], list[str]]:
    missing = [field for field in REQUIRED_FIELDS if field not in data]
    if missing:
        raise ValueError(f"Missing required prompt fields: {', '.join(missing)}")

    assistant = data["assistant"]
    rules = data["rules"]
    style = data.get("style", [])

    if not isinstance(assistant, str) or not assistant.strip():
        raise ValueError("Prompt field 'assistant' must be a non-empty string.")
    if not isinstance(rules, list) or not all(isinstance(rule, str) for rule in rules):
        raise ValueError("Prompt field 'rules' must be a list of strings.")
    if style and (not isinstance(style, list) or not all(isinstance(item, str) for item in style)):
        raise ValueError("Prompt field 'style' must be a list of strings when provided.")

    return assistant.strip(), [rule.strip() for rule in rules], [item.strip() for item in style]


def load_system_prompt(path: Path | None = None) -> str:
    prompt_path = path or PROMPT_PATH
    raw = yaml.safe_load(prompt_path.read_text(encoding="utf-8"))

    if not isinstance(raw, dict):
        raise ValueError("System prompt YAML must contain a mapping at the root.")

    assistant, rules, style = _validate_prompt(raw)

    lines = [f"Assistant: {assistant}", "Règles:"] + [f"- {rule}" for rule in rules]
    if style:
        lines.append("Style:")
        lines.extend([f"- {item}" for item in style])

    return "\n".join(lines).strip()
