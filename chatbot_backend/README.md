# Chatbot Backend (FastAPI)

FastAPI backend for the portfolio chatbot, powered by Groq.

## Local run

```bash
export GROQ_API_KEY="your_key"
export GROQ_MODEL="llama-3.1-8b-instant"
export GROQ_TEMPERATURE="0.2"
export GROQ_TIMEOUT_SECONDS="25"
export GROQ_MAX_CONCURRENT_REQUESTS="2"
export GROQ_QUEUE_TIMEOUT_SECONDS="5"
export PROMPT_GUARD_ENABLED="true"
export PROMPT_GUARD_PRIMARY_MODEL="meta-llama/llama-prompt-guard-2-86m"
export PROMPT_GUARD_FALLBACK_MODEL="meta-llama/llama-prompt-guard-2-22m"
export PROMPT_GUARD_TIMEOUT_SECONDS="3"
export PROMPT_GUARD_MALICIOUS_THRESHOLD="0.5"
export EMBEDDING_MODEL="sentence-transformers/all-MiniLM-L6-v2"

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8001
```

## Docker run

```bash
docker build -t chatbot-backend .
docker run -p 8001:8001 \
  -e GROQ_API_KEY="your_key" \
  -e GROQ_MODEL="llama-3.1-8b-instant" \
  -e GROQ_TEMPERATURE="0.2" \
  -e GROQ_TIMEOUT_SECONDS="25" \
  -e GROQ_MAX_CONCURRENT_REQUESTS="2" \
  -e GROQ_QUEUE_TIMEOUT_SECONDS="5" \
  -e PROMPT_GUARD_ENABLED="true" \
  -e PROMPT_GUARD_PRIMARY_MODEL="meta-llama/llama-prompt-guard-2-86m" \
  -e PROMPT_GUARD_FALLBACK_MODEL="meta-llama/llama-prompt-guard-2-22m" \
  -e PROMPT_GUARD_TIMEOUT_SECONDS="3" \
  -e PROMPT_GUARD_MALICIOUS_THRESHOLD="0.5" \
  -e EMBEDDING_MODEL="sentence-transformers/all-MiniLM-L6-v2" \
  chatbot-backend
```

## Environment variables

- `GROQ_API_KEY`: required.
- `GROQ_MODEL`: optional, defaults to `llama-3.1-8b-instant`.
- `GROQ_TEMPERATURE`: optional, defaults to `0.2`.
- `GROQ_TIMEOUT_SECONDS`: optional, defaults to `25`; accepted range is greater than `0` and at most `120`.
- `GROQ_MAX_CONCURRENT_REQUESTS`: maximum simultaneous chat pipelines per backend process, defaults to `2`.
- `GROQ_QUEUE_TIMEOUT_SECONDS`: maximum wait for a pipeline slot before returning HTTP `503`, defaults to `5`.
- `PROMPT_GUARD_ENABLED`: enables prompt injection screening before FAISS and the main LLM.
- `PROMPT_GUARD_PRIMARY_MODEL`: defaults to the multilingual Prompt Guard 86M model.
- `PROMPT_GUARD_FALLBACK_MODEL`: defaults to Prompt Guard 22M and is used only after a `429` from the primary model.
- `PROMPT_GUARD_TIMEOUT_SECONDS`: timeout per guard request, defaults to `3`.
- `PROMPT_GUARD_MALICIOUS_THRESHOLD`: malicious probability threshold between `0` and `1`, defaults to `0.5`.
- `EMBEDDING_MODEL`: local SentenceTransformers model used by the FAISS index and runtime query vectorization.
- `KB_DIR`: optional, defaults to `../kb_faiss` (or `/app/kb_faiss` in Docker).
- `KB_INDEX_PATH`: optional, path to `kb.index.faiss` (overrides `KB_DIR`).
- `KB_META_PATH`: optional, path to `kb.index.meta.json` (overrides `KB_DIR`).
- `KB_TOP_K`: optional, defaults to `4`.
- `KB_MIN_SCORE`: optional, defaults to `0.0`.

## Endpoints

- `GET /health` -> `{ "status": "ok" }`
- `POST /chat` -> `{ "answer": "string" }`
