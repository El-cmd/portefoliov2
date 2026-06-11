from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import json
import re
import unicodedata
from typing import Any

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

from app.core.config import get_settings


RAG_INSTRUCTIONS = (
    "Tu dois repondre uniquement avec les informations contenues dans EXCERPTS. "
    "Reponds seulement a la question posee, en 1 a 3 phrases maximum. "
    "Pour une question d'identite du type 'qui es-tu', reponds en une seule phrase courte. "
    "Ne liste pas toutes les competences ou tous les services sauf si l'utilisateur le demande explicitement. "
    "Si EXCERPTS contient un bloc ```ui, recopie ce bloc exactement dans ta reponse sans le modifier. "
    "Si les extraits ne contiennent pas la reponse, dis-le clairement et propose /contact. "
    "N'invente rien."
)

_IMAGE_MD_RE = re.compile(r"!\[(?P<alt>[^\]]*)\]\((?P<url>[^)]+)\)")
_IMAGE_HTML_RE = re.compile(
    r"<img\s+[^>]*src=[\"'](?P<url>[^\"']+)[\"'][^>]*>",
    re.IGNORECASE,
)
_UI_BLOCK_RE = re.compile(r"```ui\s*[\s\S]*?```")
_HEADING_LINE_RE = re.compile(r"(?m)^#{1,6}\s+.+$")
_SEPARATOR_LINE_RE = re.compile(r"(?m)^-{3,}\s*$")
_SKILL_ICON_ITEMS: tuple[tuple[str, str], ...] = (
    ("HTML", "icons/html5.svg"),
    ("CSS", "icons/css3.svg"),
    ("JavaScript", "icons/javascript.svg"),
    ("TypeScript", "icons/typescript.svg"),
    ("React", "icons/react.svg"),
    ("Next.js", "icons/nextjs.svg"),
    ("Tailwind CSS", "icons/tailwindcss.svg"),
    ("Bootstrap", "icons/bootstrap.svg"),
    ("Three.js", "icons/threejs.svg"),
    ("Python", "icons/python.svg"),
    ("FastAPI", "icons/fastapi.svg"),
    ("Django", "icons/django.svg"),
    ("PostgreSQL", "icons/postgresql.svg"),
    ("SQLite", "icons/sqlite.svg"),
    ("Linux", "icons/linux.svg"),
    ("Docker", "icons/docker.svg"),
    ("Kubernetes", "icons/kubernetes.svg"),
    ("Helm", "icons/helm.svg"),
    ("Nginx", "icons/nginx.svg"),
    ("Git", "icons/git.svg"),
    ("GitHub Actions", "icons/githubactions.svg"),
    ("C", "icons/c.svg"),
    ("C++", "icons/cplusplus.svg"),
    ("Bash", "icons/bash.svg"),
    ("Godot", "icons/godot.svg"),
)


@dataclass(frozen=True)
class RagHit:
    id: str
    source: str
    chunk_index: int
    text: str
    score: float


@dataclass(frozen=True)
class RagResources:
    index: faiss.Index
    items: list[dict[str, Any]]
    embedding_model: str
    embedder: SentenceTransformer
    top_k: int
    min_score: float


@dataclass(frozen=True)
class RagContext:
    hits: list[RagHit]
    excerpts: str
    attachments: list[dict[str, Any]]


def _resolve_kb_dir() -> Path:
    settings = get_settings()
    if settings.kb_dir:
        return Path(settings.kb_dir)

    candidates = [
        Path("/app/kb_faiss"),
        Path("/app/kb"),
        Path.cwd() / "kb_faiss",
        Path.cwd() / "kb",
        Path(__file__).resolve().parents[3] / "kb_faiss",
        Path(__file__).resolve().parents[3] / "kb",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[-1]


def _resolve_paths() -> tuple[Path, Path]:
    settings = get_settings()
    if settings.kb_index_path and settings.kb_meta_path:
        return Path(settings.kb_index_path), Path(settings.kb_meta_path)

    kb_dir = _resolve_kb_dir()
    index_path = Path(settings.kb_index_path) if settings.kb_index_path else kb_dir / "kb.index.faiss"
    meta_path = Path(settings.kb_meta_path) if settings.kb_meta_path else kb_dir / "kb.index.meta.json"
    return index_path, meta_path


def load_rag_resources() -> RagResources:
    index_path, meta_path = _resolve_paths()
    if not index_path.exists():
        raise RuntimeError(f"FAISS index not found: {index_path}")
    if not meta_path.exists():
        raise RuntimeError(f"FAISS metadata not found: {meta_path}")

    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    items = meta.get("items")
    model_name = meta.get("model")
    if not isinstance(items, list) or not items:
        raise RuntimeError("FAISS metadata does not contain any items.")
    if not isinstance(model_name, str) or not model_name.strip():
        raise RuntimeError("FAISS metadata does not define a model name.")

    settings = get_settings()
    configured_model = settings.embedding_model.strip()
    if model_name.strip() != configured_model:
        raise RuntimeError(
            "FAISS index embedding model mismatch: "
            f"index uses {model_name.strip()!r}, backend uses {configured_model!r}."
        )

    index = faiss.read_index(str(index_path))
    vector_dimension = meta.get("vector_dimension")
    if isinstance(vector_dimension, int) and vector_dimension != index.d:
        raise RuntimeError(
            "FAISS metadata dimension mismatch: "
            f"metadata declares {vector_dimension}, index uses {index.d}."
        )

    embedder = SentenceTransformer(model_name.strip())

    return RagResources(
        index=index,
        items=items,
        embedding_model=model_name.strip(),
        embedder=embedder,
        top_k=max(1, settings.kb_top_k),
        min_score=settings.kb_min_score,
    )


def _coerce_chunk_index(raw: Any) -> int:
    try:
        return int(raw)
    except (TypeError, ValueError):
        return 0


def _extract_attachments(hits: list[RagHit]) -> list[dict[str, Any]]:
    attachments: list[dict[str, Any]] = []
    seen: set[str] = set()

    for hit in hits:
        for match in _IMAGE_MD_RE.finditer(hit.text):
            url = match.group("url").strip()
            if not url or url in seen:
                continue
            seen.add(url)
            attachments.append(
                {
                    "type": "image",
                    "url": url,
                    "alt": match.group("alt").strip() or None,
                    "source_id": hit.id,
                }
            )

        for match in _IMAGE_HTML_RE.finditer(hit.text):
            url = match.group("url").strip()
            if not url or url in seen:
                continue
            seen.add(url)
            attachments.append(
                {
                    "type": "image",
                    "url": url,
                    "alt": None,
                    "source_id": hit.id,
                }
            )

    return attachments


def _normalize_query(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value.lower())
    return "".join(char for char in normalized if unicodedata.category(char) != "Mn")


def _query_mentions_skills_or_technologies(query: str) -> bool:
    normalized = _normalize_query(query)
    return any(
        marker in normalized
        for marker in (
            "competence",
            "skill",
            "techno",
            "technologie",
            "stack",
            "langage",
            "sais faire",
            "savoir faire",
            "tu sais faire quoi",
            "que sais tu faire",
            "qu est ce que tu sais faire",
        )
    )


def _query_mentions_contact_or_social(query: str) -> bool:
    normalized = _normalize_query(query)
    return any(
        marker in normalized
        for marker in (
            "contact",
            "contacter",
            "joindre",
            "coordonnees",
            "email",
            "mail",
            "telephone",
            "tel",
            "appel",
            "linkedin",
            "github",
            "reseau",
            "reseaux",
            "social",
            "sociaux",
        )
    )


def _query_mentions_profile_image_or_formation(query: str) -> bool:
    normalized = _normalize_query(query)
    return any(
        marker in normalized
        for marker in (
            "qui es tu",
            "qui es-tu",
            "tu es qui",
            "presente toi",
            "profil",
            "photo",
            "image",
            "formation",
            "ecole",
            "42",
        )
    )


def _preferred_sources_for_query(query: str) -> set[str] | None:
    normalized = _normalize_query(query)

    if _query_mentions_contact_or_social(query):
        return {"contact.md"}

    if any(marker in normalized for marker in ("projet", "portfolio", "realisation")):
        return {"projects.md"}

    if _query_mentions_skills_or_technologies(query):
        return {"skills.md"}

    if any(
        marker in normalized
        for marker in (
            "qui es tu",
            "qui es-tu",
            "qui est tu",
            "tu es qui",
            "presente toi",
            "presente-toi",
            "parle moi de toi",
            "ton profil",
            "qui est valentin",
            "valentin loth",
            "tu fais quoi",
            "que fais tu",
            "que fais-tu",
            "formation",
            "ecole",
            "42",
            "photo",
            "profil",
        )
    ):
        return {"about.md"}

    if any(marker in normalized for marker in ("service", "propose", "tarif", "prix", "devis", "cout")):
        return {"services.md", "pricing.md"}

    return None


def _has_retrievable_text(text: str) -> bool:
    body = _HEADING_LINE_RE.sub("", text)
    body = _SEPARATOR_LINE_RE.sub("", body).strip()
    return len(body) >= 40


def _should_skip_hit_for_query(hit: RagHit, retrieval_query: str) -> bool:
    normalized_query = _normalize_query(retrieval_query)
    normalized_text = _normalize_query(hit.text)
    asks_for_services = any(marker in normalized_query for marker in ("service", "propose", "prestation"))
    asks_for_limits = any(marker in normalized_query for marker in ("ne propose pas", "limite", "pas faire"))

    if hit.source == "services.md" and asks_for_services and not asks_for_limits:
        return "ce que je ne propose pas" in normalized_text

    return False


def _metadata_haystack(item: dict[str, Any], hit: RagHit) -> str:
    keywords = item.get("keywords", [])
    keyword_text = " ".join(str(keyword) for keyword in keywords) if isinstance(keywords, list) else ""
    return _normalize_query(
        " ".join(
            (
                str(item.get("heading", "")),
                keyword_text,
                str(item.get("search_text", "")),
                hit.text,
            )
        )
    )


def _rank_score_for_query(score: float, item: dict[str, Any], hit: RagHit, retrieval_query: str) -> float:
    normalized_query = _normalize_query(retrieval_query)
    haystack = _metadata_haystack(item, hit)
    rank_score = score

    asks_social = any(marker in normalized_query for marker in ("reseau", "reseaux", "social", "sociaux"))
    if asks_social:
        if any(marker in haystack for marker in ("reseaux sociaux", "profils sociaux", "linkedin", "github")):
            rank_score += 0.35
        elif hit.source == "contact.md":
            rank_score -= 0.04

    asks_direct_contact = any(
        marker in normalized_query
        for marker in ("contact", "contacter", "joindre", "coordonnees", "email", "mail", "telephone", "appel")
    )
    if asks_direct_contact and "contact principal" in haystack:
        rank_score += 0.18

    asks_services = any(marker in normalized_query for marker in ("service", "propose", "prestation"))
    if asks_services:
        if "description" in haystack:
            rank_score += 0.12
        elif "cas d'usage" in haystack:
            rank_score += 0.04

    asks_technologies = any(marker in normalized_query for marker in ("techno", "technologie", "stack", "langage"))
    asks_skills = _query_mentions_skills_or_technologies(retrieval_query)
    if asks_skills:
        if hit.source == "skills.md" and ("synthese rapide" in haystack or "technologies principales" in haystack):
            rank_score += 0.65
        elif "technologies" in haystack:
            rank_score += 0.35
        elif "competences" in haystack:
            rank_score += 0.22
        if "cas d'usage" in haystack:
            rank_score -= 0.2 if asks_technologies else 0.12

    asks_formation = any(marker in normalized_query for marker in ("formation", "ecole", "42"))
    asks_identity = any(
        marker in normalized_query
        for marker in (
            "qui es tu",
            "qui es-tu",
            "qui est tu",
            "tu es qui",
            "presente toi",
            "presente-toi",
            "parle moi de toi",
            "ton profil",
            "qui est valentin",
            "valentin loth",
            "photo",
            "image",
            "profil",
        )
    )
    if hit.source == "about.md":
        if asks_formation:
            if "ma formation" in haystack or "ecole 42" in haystack:
                rank_score += 0.35
            elif "identite" in haystack or "pitch court" in haystack:
                rank_score -= 0.18
        elif asks_identity:
            if "ma formation" in haystack:
                rank_score -= 0.35
            if "pitch court" in haystack:
                rank_score += 0.32
            if "identite" in haystack:
                rank_score += 0.18

    return rank_score


def _result_limit_for_query(default_top_k: int, retrieval_query: str) -> int:
    normalized_query = _normalize_query(retrieval_query)
    if any(marker in normalized_query for marker in ("formation", "ecole", "42")):
        return 1
    if any(marker in normalized_query for marker in ("service", "propose", "prestation")):
        return max(default_top_k, 3)
    if any(marker in normalized_query for marker in ("techno", "technologie", "stack", "langage")):
        return max(default_top_k, 4)
    if _query_mentions_skills_or_technologies(retrieval_query):
        return max(default_top_k, 3)

    return default_top_k


def retrieve_context(
    resources: RagResources,
    query: str,
) -> RagContext:
    retrieval_query = query
    preferred_sources = _preferred_sources_for_query(query)
    intent_query = query

    vector = resources.embedder.encode([retrieval_query], normalize_embeddings=True)
    vectors = np.asarray(vector, dtype="float32")
    if vectors.shape[1] != resources.index.d:
        raise RuntimeError(
            "Embedding dimension mismatch: "
            f"query has {vectors.shape[1]} dimensions, FAISS index expects {resources.index.d}."
        )

    candidate_count = min(
        resources.index.ntotal,
        resources.index.ntotal if preferred_sources else max(resources.top_k * 6, resources.top_k),
    )

    scores, indices = resources.index.search(vectors, candidate_count)
    global_hits: list[tuple[float, RagHit]] = []
    preferred_hits: list[tuple[float, RagHit]] = []

    for score, idx in zip(scores[0], indices[0]):
        if idx < 0 or idx >= len(resources.items):
            continue

        item = resources.items[idx]
        hit = RagHit(
            id=str(item.get("id", "")),
            source=str(item.get("source", "")),
            chunk_index=_coerce_chunk_index(item.get("chunk_index")),
            text=str(item.get("text", "")),
            score=float(score),
        )
        rank_score = _rank_score_for_query(float(score), item, hit, intent_query)
        if rank_score < resources.min_score:
            continue
        if not _has_retrievable_text(hit.text):
            continue
        if _should_skip_hit_for_query(hit, intent_query):
            continue

        global_hits.append((rank_score, hit))
        if preferred_sources and hit.source in preferred_sources:
            preferred_hits.append((rank_score, hit))

    selected_hits = preferred_hits if preferred_hits else global_hits
    selected_hits.sort(key=lambda item: item[0], reverse=True)
    result_limit = _result_limit_for_query(resources.top_k, intent_query)
    hits = [hit for _, hit in selected_hits[:result_limit]]

    excerpts = "\n\n".join(f"[{hit.id}] {hit.text}" for hit in hits)
    attachments = _extract_attachments(hits)

    return RagContext(hits=hits, excerpts=excerpts, attachments=attachments)


def _normalize_vectors(vectors: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    if np.any(norms == 0):
        raise RuntimeError("Embedding model returned a zero vector.")
    return (vectors / norms).astype("float32")


def build_rag_prompt(excerpts: str) -> str:
    if not excerpts:
        return f"{RAG_INSTRUCTIONS}\n\nEXCERPTS:\n(Aucun extrait trouve.)"
    return f"{RAG_INSTRUCTIONS}\n\nEXCERPTS:\n{excerpts}"


def _extract_ui_blocks(hits: list[RagHit], query: str) -> list[str]:
    blocks: list[str] = []
    seen: set[str] = set()
    normalized_query = _normalize_query(query)
    asks_social = any(marker in normalized_query for marker in ("reseau", "reseaux", "social", "sociaux", "linkedin", "github"))
    asks_direct_contact = any(
        marker in normalized_query
        for marker in ("contact", "contacter", "joindre", "coordonnees", "email", "mail", "telephone", "tel", "appel")
    )
    asks_formation = any(marker in normalized_query for marker in ("formation", "ecole", "42"))
    asks_profile_image = any(
        marker in normalized_query
        for marker in ("qui es tu", "qui es-tu", "tu es qui", "presente toi", "profil", "photo", "image")
    )

    for hit in hits:
        normalized_hit = _normalize_query(hit.text)
        if asks_social and not any(marker in normalized_hit for marker in ("linkedin", "github", "reseaux", "reseau")):
            continue
        if asks_direct_contact and not asks_social and not any(marker in normalized_hit for marker in ("mailto:", "tel:", "telephone", "email", "mail")):
            continue

        for match in _UI_BLOCK_RE.finditer(hit.text):
            block = match.group(0).strip()
            normalized_block = _normalize_query(block)
            if asks_formation and not any(marker in normalized_block for marker in ("42", "formation", "ecole")):
                continue
            if asks_profile_image and not asks_formation and any(marker in normalized_block for marker in ("logo de 42", "assets/42.png")):
                continue
            if block in seen:
                continue

            seen.add(block)
            blocks.append(block)

    return blocks


def _build_skill_icons_ui_block() -> str:
    lines = ["```ui", "icons:"]
    for label, url in _SKILL_ICON_ITEMS:
        lines.extend((f"  - label: {label}", f"    url: {url}"))
    lines.append("```")
    return "\n".join(lines)


def _should_include_skill_icons(query: str, hits: list[RagHit]) -> bool:
    return _query_mentions_skills_or_technologies(query) and any(hit.source == "skills.md" for hit in hits)


def _answer_claims_missing_info(answer: str) -> bool:
    normalized = _normalize_query(answer)
    return any(
        marker in normalized
        for marker in (
            "je ne dispose pas",
            "je n ai pas",
            "je n'ai pas",
            "pas d information",
            "pas d'informations",
            "aucune information",
            "extraits fournis",
        )
    )


def ensure_ui_blocks_in_answer(answer: str, query: str, rag_context: RagContext) -> str:
    ui_blocks = _extract_ui_blocks(rag_context.hits, query)
    if _should_include_skill_icons(query, rag_context.hits):
        ui_blocks.append(_build_skill_icons_ui_block())

    if not ui_blocks or "```ui" in answer:
        return answer

    should_force_ui = (
        _query_mentions_contact_or_social(query)
        or _query_mentions_profile_image_or_formation(query)
        or _query_mentions_skills_or_technologies(query)
        or _answer_claims_missing_info(answer)
    )
    if not should_force_ui:
        return answer

    normalized_query = _normalize_query(query)
    blocks = "\n\n".join(ui_blocks)
    if any(marker in normalized_query for marker in ("reseau", "reseaux", "social", "sociaux", "linkedin", "github")):
        intro = "Voici les reseaux et liens utiles de Valentin :"
    elif any(marker in normalized_query for marker in ("contact", "contacter", "joindre", "coordonnees", "email", "mail", "telephone", "tel", "appel")):
        intro = "Vous pouvez contacter Valentin ici :"
    elif any(marker in normalized_query for marker in ("formation", "ecole", "42")):
        intro = "Voici le visuel lie a la formation de Valentin :"
    elif any(marker in normalized_query for marker in ("photo", "image", "profil", "qui es tu", "qui es-tu", "tu es qui", "presente toi")):
        intro = "Voici la photo de profil de Valentin :"
    elif _query_mentions_skills_or_technologies(query):
        intro = "Voici les logos des technologies associees :"
    else:
        intro = "Voici les liens utiles :"

    if _answer_claims_missing_info(answer):
        return f"{intro}\n\n{blocks}"

    return f"{answer.rstrip()}\n\n{blocks}"
