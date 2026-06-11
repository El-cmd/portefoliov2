#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


QUESTIONS_FILE = Path("QUESTIONS_CHATBOT.md")
OUTPUT_FILE = Path("REPONSES_CHATBOT.md")
DEFAULT_CHAT_URL = "http://localhost:8001/chat"

SELECTED_QUESTIONS = {
    "Identite": "Qui es-tu ?",
    "Contact": "Comment te contacter ?",
    "Reseaux sociaux": "Valentin a-t-il des reseaux sociaux ?",
    "Services": "Quels services proposes-tu ?",
    "Competences": "Quelles technologies maitrises-tu ?",
    "Projets": "Quels projets as-tu realises ?",
    "Tarifs": "Quels sont tes tarifs ?",
    "Process": "Comment se passe un projet avec toi ?",
    "Questions de suivi": "Et les reseaux ?",
    "Formulations avec fautes": "valentin a til des reseau sociaux ?",
}

def parse_question_categories(path: Path) -> dict[str, list[str]]:
    categories: dict[str, list[str]] = {}
    current_category: str | None = None

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if line.startswith("## "):
            current_category = line.removeprefix("## ").strip()
            categories[current_category] = []
            continue

        if current_category and line.startswith("- "):
            categories[current_category].append(line.removeprefix("- ").strip())

    return categories


def choose_questions(categories: dict[str, list[str]]) -> list[tuple[str, str]]:
    selected: list[tuple[str, str]] = []

    for category, questions in categories.items():
        if not questions:
            continue

        preferred_question = SELECTED_QUESTIONS.get(category)
        question = preferred_question if preferred_question in questions else questions[0]
        selected.append((category, question))

    return selected


def call_chatbot(url: str, question: str, timeout: float) -> dict[str, Any]:
    body = json.dumps({"message": question}).encode("utf-8")
    request = Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=timeout) as response:
            payload = json.loads(response.read().decode("utf-8"))
            return {
                "ok": True,
                "status": response.status,
                "payload": payload,
            }
    except HTTPError as error:
        raw_body = error.read().decode("utf-8", errors="replace")
        return {
            "ok": False,
            "status": error.code,
            "error": raw_body,
        }
    except (TimeoutError, URLError) as error:
        return {
            "ok": False,
            "status": None,
            "error": str(error),
        }


def format_sources(sources: list[dict[str, Any]]) -> str:
    if not sources:
        return "- Aucun"

    lines = []
    for source in sources:
        score = source.get("score")
        score_label = f"{score:.3f}" if isinstance(score, float) else str(score)
        lines.append(f"- `{source.get('source')}#{source.get('chunk_index')}` score `{score_label}`")

    return "\n".join(lines)


def write_report(
    output_file: Path,
    chat_url: str,
    delay_seconds: float,
    results: list[tuple[str, str, dict[str, Any]]],
) -> None:
    now = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")
    lines = [
        "# Reponses chatbot par categorie",
        "",
        f"- Date: `{now}`",
        f"- Endpoint: `{chat_url}`",
        f"- Delai entre requetes: `{delay_seconds}s`",
        f"- Nombre de questions: `{len(results)}`",
        "",
    ]

    for category, question, result in results:
        lines.extend(
            [
                f"## {category}",
                "",
                f"**Question:** {question}",
                "",
            ]
        )

        if not result["ok"]:
            lines.extend(
                [
                    f"**Status:** `{result['status']}`",
                    "",
                    "**Erreur:**",
                    "",
                    str(result["error"]),
                    "",
                ]
            )
            continue

        payload = result["payload"]
        answer = str(payload.get("answer", "")).strip()
        sources = payload.get("sources", [])

        lines.extend(
            [
                f"**Status:** `{result['status']}`",
                "",
                "**Reponse:**",
                "",
                answer or "_Reponse vide._",
                "",
                "**Sources:**",
                "",
                format_sources(sources if isinstance(sources, list) else []),
                "",
            ]
        )

    output_file.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Pose une question par categorie au chatbot.")
    parser.add_argument("--url", default=DEFAULT_CHAT_URL, help="Endpoint /chat du chatbot.")
    parser.add_argument("--questions", type=Path, default=QUESTIONS_FILE, help="Fichier de questions Markdown.")
    parser.add_argument("--output", type=Path, default=OUTPUT_FILE, help="Fichier de rapport Markdown.")
    parser.add_argument("--delay", type=float, default=8.0, help="Delai entre deux requetes, en secondes.")
    parser.add_argument("--timeout", type=float, default=45.0, help="Timeout HTTP par requete, en secondes.")
    args = parser.parse_args()

    categories = parse_question_categories(args.questions)
    selected_questions = choose_questions(categories)
    if not selected_questions:
        raise SystemExit(f"Aucune question trouvee dans {args.questions}.")

    results: list[tuple[str, str, dict[str, Any]]] = []
    for index, (category, question) in enumerate(selected_questions, start=1):
        print(f"[{index}/{len(selected_questions)}] {category}: {question}")
        result = call_chatbot(args.url, question, args.timeout)
        results.append((category, question, result))

        if index < len(selected_questions) and args.delay > 0:
            time.sleep(args.delay)

    write_report(args.output, args.url, args.delay, results)
    print(f"Rapport ecrit dans {args.output}")


if __name__ == "__main__":
    main()
