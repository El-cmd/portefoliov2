from __future__ import annotations

from contextlib import contextmanager
from functools import lru_cache
from threading import BoundedSemaphore
from typing import Iterator

from app.core.config import get_settings


class ChatPipelineBusyError(RuntimeError):
    """Raised when no chatbot pipeline slot becomes available in time."""


class ChatPipelineLimiter:
    def __init__(self, max_concurrent_requests: int, queue_timeout_seconds: float) -> None:
        self._semaphore = BoundedSemaphore(max_concurrent_requests)
        self.queue_timeout_seconds = queue_timeout_seconds

    @contextmanager
    def slot(self) -> Iterator[None]:
        acquired = self._semaphore.acquire(timeout=self.queue_timeout_seconds)
        if not acquired:
            raise ChatPipelineBusyError("Chatbot concurrency limit reached.")

        try:
            yield
        finally:
            self._semaphore.release()


@lru_cache(maxsize=1)
def get_chat_pipeline_limiter() -> ChatPipelineLimiter:
    settings = get_settings()
    return ChatPipelineLimiter(
        max_concurrent_requests=settings.groq_max_concurrent_requests,
        queue_timeout_seconds=settings.groq_queue_timeout_seconds,
    )
