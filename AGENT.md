# AGENT.md

## Purpose

This repository is a Docker Compose portfolio workspace with:

- `frontend/`: main Next.js portfolio frontend
- `gateway/`: Nginx reverse proxy and the only published local HTTP entry point
- `cms/strapi/`: Strapi CMS backed by PostgreSQL
- `chatbot_backend/`: optional FastAPI/Groq chatbot backend with FAISS RAG and local all-MiniLM embeddings
- `kb/`: local chatbot Markdown sources, intentionally not versioned
- `kb_faiss/`: generated FAISS artifacts deployed to runtime environments

The old Vite frontend was replaced by the former `frontend-test` Next.js app. There is no active `frontend-test` service anymore.

## Architecture

### Frontend

- Stack: Next.js 16 app router, React 19, Tailwind CSS
- Public dev URL through Nginx: `http://localhost:8080`
- Internal Docker URL: `http://frontend:5173`
- Main UI: `frontend/app/page.tsx`
- Layout and metadata: `frontend/app/layout.tsx`
- Strapi API route: `frontend/app/api/projects/route.ts`
- Strapi types/helpers: `frontend/lib/strapi.ts`
- Next rewrites: `frontend/next.config.mjs`

Current navigation model:

- horizontal rail with `HUB`, `Home`, and `About`
- vertical scroll from `Home` to the chatbot UI
- annex pages like `HUB` and `About` should not scroll down into chatbot

### Strapi

- Admin URL through Nginx: `http://cms.localhost:8080/admin`
- Internal Docker URL used by frontend: `http://strapi:1337`
- Strapi is not directly published on the host.
- Database service: `postgres`

### Backend

- FastAPI service on internal port `8001`; it is not published on the host.
- Main endpoint: `POST /chat`
- Health endpoint: `GET /health`
- Requires FAISS files in `kb_faiss/` to start successfully.
- Query vectorization uses the local `EMBEDDING_MODEL`; default is `sentence-transformers/all-MiniLM-L6-v2`.

## Commands

Run from repository root.

```bash
make up                 # start all non-profile services
make up-gateway         # start the Nginx gateway only
make up-frontend        # start frontend only, no dependencies
make up-front-cms       # start PostgreSQL, wait for health, then frontend + Strapi
make up-front-cms-stable # build Strapi admin, then start frontend + Strapi without hot-reload develop mode
make up-strapi          # start Strapi
make up-chatbot         # start chatbot_backend only
make up-build           # rebuild and start all non-profile services
make up-build-front-cms # rebuild and start frontend + Strapi stack
make stop               # stop all services
make stop-front-cms     # stop frontend + Strapi + PostgreSQL
make down               # docker compose down --remove-orphans
make logs               # tail gateway/frontend/chatbot_backend/strapi/postgres logs
make build              # build chatbot_backend + frontend + frontend-prod + strapi
make build-no-chatbot   # build frontend images only
make build-kb           # build local FAISS index using all-MiniLM
```

The Makefile intentionally uses `COMPOSE_BAKE=false docker compose`.

## Docker Services

### `gateway`

- Publishes `${GATEWAY_PORT:-8080}:80`
- Routes the default host to Next.js.
- Routes `cms.localhost` to Strapi.
- Applies an 8 KiB body limit and Nginx rate limiting to `/api/chat`.
- Overwrites forwarded client IP headers before proxying.

### `frontend`

- Builds `./frontend`, target `dev`
- Exposes internal port `5173`; no host port is published.
- Mounts:
  - `./frontend:/app`
  - `frontend_node_modules:/app/node_modules`
  - `frontend_next:/app/.next`
- Uses:
  - `STRAPI_INTERNAL_URL=http://strapi:1337`
  - `STRAPI_API_TOKEN=${STRAPI_API_TOKEN:-}`

### `frontend-prod`

- Profile: `prod`
- Builds `./frontend`, target `prod`
- Exposes internal port `5173` and uses the `frontend` network alias for `gateway-prod`.

### `strapi`

- Exposes internal port `1337`; no host port is published.
- Depends on healthy `postgres`
- Uses persistent volumes for node modules and uploads.
- Default command is controlled by `STRAPI_COMMAND`.
- Normal dev mode uses `npm run develop`.
- Stable admin mode uses `STRAPI_COMMAND="npm run build && npm run start"` via `make up-front-cms-stable`.

### `chatbot_backend`

- Exposes internal port `8001`; no host port is published.
- Mounts `./kb_faiss:/app/kb_faiss:ro`
- Uses local SentenceTransformers embeddings at runtime; the FAISS index must be built with the same `EMBEDDING_MODEL`.

## Strapi Project Model

Current content type:

```text
cms/strapi/src/api/project/content-types/project/schema.json
```

Fields:

- `name`: string, required
- `media`: single image or video
- `git_url`: GitHub/project source URL
- `project_url`: live project URL
- `description`: text
- `date`: project date

`draftAndPublish` is enabled. A project must be published to appear in frontend queries.

## Frontend/Strapi Flow

The browser does not call Strapi directly for projects.

Flow:

```text
frontend page -> /api/projects -> Strapi /api/projects?populate=media&sort=date:desc
```

The server route is:

```text
frontend/app/api/projects/route.ts
```

It uses:

- `STRAPI_INTERNAL_URL` for the Strapi base URL
- `STRAPI_API_TOKEN` as optional server-side bearer token

Media URLs from Strapi are rendered through `/uploads/...`. `frontend/next.config.mjs` rewrites `/uploads/*` to Strapi.

If Public permissions are open:

- no token is required

If Public permissions are closed:

- create a Strapi read-only API token
- put it in root `.env` as `STRAPI_API_TOKEN=...`

Do not put `STRAPI_API_TOKEN` in client-side `NEXT_PUBLIC_*` variables.

## Validation

Frontend-only:

```bash
cd frontend
npm run build
```

Compose config:

```bash
docker compose config --quiet
```

Frontend + CMS:

```bash
make up-front-cms
```

Check:

- `http://localhost:8080`
- `http://localhost:8080/api/projects`
- `http://cms.localhost:8080/admin`

## Known Issues

### Backend FAISS startup failure

If `chatbot_backend` fails with `FAISS index not found`, this is not a frontend bug. The generated `kb_faiss/` artifacts are missing:

```text
kb_faiss/kb.index.faiss
kb_faiss/kb.index.meta.json
```

Build them locally before running the chatbot:

```bash
pip install -r kb/requirements.txt
make build-kb
```

### Strapi project not visible

Check:

- project is published
- Public role has `find` permission, or `STRAPI_API_TOKEN` is configured
- Strapi and PostgreSQL are running
- `http://localhost:8080/api/projects` returns data

### Old frontend-test containers

The `frontend-test` service was removed. If Docker reports orphans, run:

```bash
make down
```

## Rules For Future Agents

1. Treat Strapi as the source of truth for project cards.
2. Do not reintroduce hardcoded project cards in `frontend/app/page.tsx` except temporary placeholders for explicit UI experiments.
3. Keep Strapi tokens server-side only.
4. When changing the Strapi schema, update `frontend/lib/strapi.ts` and project rendering in `frontend/app/page.tsx`.
5. Keep Next.js on internal port `5173` and expose the application only through the gateway.
6. Do not restore the old Vite frontend unless the user explicitly asks.
7. Do not commit or expose `.env`, `kb/`, `kb_faiss/`, Strapi uploads, or local build artifacts.
