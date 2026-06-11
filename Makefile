.PHONY: up up-all up-gateway up-frontend up-chatbot up-strapi up-front-cms up-front-cms-stable up-build up-build-front-cms stop stop-all stop-gateway stop-frontend stop-chatbot stop-strapi stop-postgres stop-cms stop-front-cms down logs build build-no-chatbot build-strapi build-kb prod prod-build prod-config prod-down prod-logs

COMPOSE = COMPOSE_BAKE=false docker compose
PROD_COMPOSE = COMPOSE_BAKE=false docker compose -f docker-compose.prod.yml
POSTGRES_CONTAINER = book-postgres-1
HOST_UID = $(shell id -u)
HOST_GID = $(shell id -g)

up:
	$(MAKE) up-all

up-all:
	$(COMPOSE) up

up-gateway:
	$(COMPOSE) up gateway --no-deps

up-frontend:
	$(COMPOSE) up frontend gateway --no-deps

up-chatbot:
	$(COMPOSE) up chatbot_backend

up-strapi:
	$(COMPOSE) up strapi gateway

up-front-cms:
	$(COMPOSE) up -d postgres
	@printf 'Waiting for PostgreSQL to become healthy'
	@until [ "$$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}starting{{end}}' $(POSTGRES_CONTAINER) 2>/dev/null)" = "healthy" ]; do \
		printf '.'; \
		sleep 2; \
	done
	@printf '\n'
	$(COMPOSE) up frontend strapi gateway --no-deps

up-front-cms-stable:
	$(COMPOSE) up -d postgres
	@printf 'Waiting for PostgreSQL to become healthy'
	@until [ "$$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}starting{{end}}' $(POSTGRES_CONTAINER) 2>/dev/null)" = "healthy" ]; do \
		printf '.'; \
		sleep 2; \
	done
	@printf '\n'
	STRAPI_COMMAND="npm run build && npm run start" $(COMPOSE) up --force-recreate frontend strapi gateway --no-deps

up-build:
	$(COMPOSE) up --build

up-build-front-cms:
	$(COMPOSE) up -d postgres
	@printf 'Waiting for PostgreSQL to become healthy'
	@until [ "$$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}starting{{end}}' $(POSTGRES_CONTAINER) 2>/dev/null)" = "healthy" ]; do \
		printf '.'; \
		sleep 2; \
	done
	@printf '\n'
	$(COMPOSE) up --build frontend strapi gateway --no-deps

stop:
	$(MAKE) stop-all

stop-all:
	$(COMPOSE) stop

stop-gateway:
	$(COMPOSE) stop gateway gateway-prod

stop-frontend:
	$(COMPOSE) stop frontend

stop-chatbot:
	$(COMPOSE) stop chatbot_backend

stop-strapi:
	$(COMPOSE) stop strapi

stop-postgres:
	$(COMPOSE) stop postgres

stop-cms:
	$(COMPOSE) stop strapi postgres

stop-front-cms:
	$(COMPOSE) stop gateway frontend strapi postgres

down:
	$(COMPOSE) down --remove-orphans

logs:
	$(COMPOSE) logs -f --tail=100 gateway frontend chatbot_backend strapi postgres

build:
	$(COMPOSE) build chatbot_backend frontend frontend-prod strapi

build-no-chatbot:
	$(COMPOSE) build frontend frontend-prod

build-strapi:
	$(COMPOSE) build strapi

build-kb:
	docker run --rm \
		-e EMBEDDING_MODEL="$${EMBEDDING_MODEL:-sentence-transformers/all-MiniLM-L6-v2}" \
		-e HF_HOME=/root/.cache/huggingface \
		-e HOST_UID=$(HOST_UID) \
		-e HOST_GID=$(HOST_GID) \
		-v "$(CURDIR)":/workspace \
		-v book_kb_pip_cache:/root/.cache/pip \
		-v book_kb_hf_cache:/root/.cache/huggingface \
		-w /workspace \
		python:3.11-slim \
		sh -c 'apt-get update && apt-get install -y --no-install-recommends libgomp1 && rm -rf /var/lib/apt/lists/* && python -m pip install --upgrade pip && python -m pip install -r kb/requirements.txt && python kb/build_faiss.py --kb-dir kb --out-dir kb_faiss && chown -R "$$HOST_UID:$$HOST_GID" kb_faiss'

prod:
	$(PROD_COMPOSE) up -d

prod-build:
	$(PROD_COMPOSE) up -d --build

prod-config:
	$(PROD_COMPOSE) config --quiet

prod-down:
	$(PROD_COMPOSE) down

prod-logs:
	$(PROD_COMPOSE) logs -f --tail=100
