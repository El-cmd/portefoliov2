from __future__ import annotations

from typing import Literal

import logging

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.config import get_settings
from app.services.concurrency_limiter import (
    ChatPipelineBusyError,
    get_chat_pipeline_limiter,
)
from app.services.groq_client import generate_answer
from app.services.prompt_guard import PromptGuardUnavailableError, check_prompt
from app.services.prompt_loader import load_system_prompt
from app.services.rag_service import (
    build_rag_prompt,
    ensure_ui_blocks_in_answer,
    load_rag_resources,
    retrieve_context,
)

logger = logging.getLogger("uvicorn.error")
MAX_REQUEST_BODY_BYTES = 8 * 1024


class RequestBodyLimitMiddleware:
    def __init__(self, app: ASGIApp, max_body_bytes: int) -> None:
        self.app = app
        self.max_body_bytes = max_body_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = dict(scope.get("headers", []))
        content_length = headers.get(b"content-length")
        if content_length:
            try:
                if int(content_length) > self.max_body_bytes:
                    await self._send_too_large(send)
                    return
            except ValueError:
                pass

        chunks: list[bytes] = []
        total_bytes = 0
        more_body = True

        while more_body:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            if message["type"] != "http.request":
                continue

            chunk = message.get("body", b"")
            total_bytes += len(chunk)
            if total_bytes > self.max_body_bytes:
                await self._send_too_large(send)
                return

            chunks.append(chunk)
            more_body = message.get("more_body", False)

        body = b"".join(chunks)
        delivered = False

        async def replay_receive() -> Message:
            nonlocal delivered
            if delivered:
                return {"type": "http.request", "body": b"", "more_body": False}
            delivered = True
            return {"type": "http.request", "body": body, "more_body": False}

        await self.app(scope, replay_receive, send)

    @staticmethod
    async def _send_too_large(send: Send) -> None:
        body = b'{"detail":"Request body is too large."}'
        await send(
            {
                "type": "http.response.start",
                "status": 413,
                "headers": [
                    (b"content-type", b"application/json"),
                    (b"content-length", str(len(body)).encode("ascii")),
                ],
            }
        )
        await send({"type": "http.response.body", "body": body})


app = FastAPI(title="portfolio chatbot backend", version="0.1.0")
app.add_middleware(RequestBodyLimitMiddleware, max_body_bytes=MAX_REQUEST_BODY_BYTES)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)


class Source(BaseModel):
    id: str
    source: str
    chunk_index: int
    score: float
    text: str


class Attachment(BaseModel):
    type: Literal["image"]
    url: str
    alt: str | None = None
    source_id: str | None = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source] = Field(default_factory=list)
    attachments: list[Attachment] = Field(default_factory=list)


@app.on_event("startup")
def load_prompt_on_startup() -> None:
    app.state.system_prompt = load_system_prompt()
    app.state.rag_resources = load_rag_resources()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: Request, payload: ChatRequest) -> ChatResponse:
    limiter = get_chat_pipeline_limiter()

    try:
        with limiter.slot():
            return _run_chat_pipeline(request, payload)
    except ChatPipelineBusyError as exc:
        retry_after = max(1, round(get_settings().groq_queue_timeout_seconds))
        raise HTTPException(
            status_code=503,
            detail="Chatbot is busy. Please retry shortly.",
            headers={"Retry-After": str(retry_after)},
        ) from exc


def _run_chat_pipeline(request: Request, payload: ChatRequest) -> ChatResponse:
    system_prompt: str = request.app.state.system_prompt
    rag_resources = request.app.state.rag_resources

    try:
        guard_result = check_prompt(payload.message)
    except PromptGuardUnavailableError as exc:
        logger.warning("Prompt guard unavailable: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Chat protection is temporarily unavailable.",
        ) from exc

    if guard_result.is_malicious:
        logger.warning(
            "Prompt rejected by prompt guard model=%s fallback=%s",
            guard_result.model,
            guard_result.used_fallback,
        )
        raise HTTPException(
            status_code=400,
            detail="Message rejected by the chatbot security policy.",
        )

    messages: list[dict[str, str]] = []

    rag_context = retrieve_context(rag_resources, payload.message)
    messages.append({"role": "system", "content": build_rag_prompt(rag_context.excerpts)})

    messages.append({"role": "user", "content": payload.message})

    try:
        answer = generate_answer(system_prompt, messages)
    except Exception as exc:  # noqa: BLE001 - provide a stable HTTP response
        logger.exception("Groq request failed")
        raise HTTPException(status_code=502, detail="LLM provider error.") from exc

    if not answer:
        raise HTTPException(status_code=502, detail="Empty response from LLM provider.")

    answer = ensure_ui_blocks_in_answer(answer, payload.message, rag_context)

    sources = [
        Source(
            id=hit.id,
            source=hit.source,
            chunk_index=hit.chunk_index,
            score=hit.score,
            text=hit.text,
        )
        for hit in rag_context.hits
    ]
    attachments = [Attachment(**item) for item in rag_context.attachments]

    return ChatResponse(answer=answer, sources=sources, attachments=attachments)
