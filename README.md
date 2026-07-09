# ChatBot-Portefolio

Portfolio Next.js avec CMS Strapi, PostgreSQL et chatbot FastAPI/Groq. Le projet est pensé pour tourner proprement en local avec Docker Compose, avec un contenu de projets piloté par Strapi et un assistant RAG optionnel.

![Accueil desktop](docs/screenshots/home-desktop.png)

## Apercu

![Accueil mobile](docs/screenshots/home-mobile.png)

![Hub projets](docs/screenshots/hub-desktop.png)

## Stack

- `frontend/` : Next.js, React, Tailwind CSS
- `gateway/` : gateway Nginx et unique point d'entree HTTP local
- `cms/strapi/` : Strapi v5 pour administrer les projets
- `postgres` : base PostgreSQL pour Strapi
- `chatbot_backend/` : FastAPI pour le chatbot
- `kb/` : sources Markdown locales du chatbot, volontairement non versionnees
- `kb_faiss/` : artefacts FAISS generes, a deployer sur le VPS
- `docker-compose.yml` : orchestration locale
- `docker-compose.prod.yml` : orchestration de production derriere Nginx Proxy Manager

## Fonctionnalites

- Landing interactive avec navigation horizontale `HUB / Home / About`
- Mode dark/light avec canvas de fond anime
- Page `HUB` connectee a Strapi pour afficher les projets
- Collection Strapi `Project` avec media image/video, liens GitHub/projet, description et date
- Chatbot FastAPI/Groq avec recuperation RAG via FAISS et embedding local leger
- Stack Docker separee : frontend, chatbot_backend, Strapi, PostgreSQL

## Demarrage rapide

Copier les variables d'environnement :

```bash
cp .env.example .env
```

Lancer le frontend + CMS :

```bash
make up-front-cms
```

Ouvrir :

- site : `http://localhost:8080`
- Strapi admin : `http://cms.localhost:8080/admin`

La gateway est le seul service publie sur la machine. Les ports internes du frontend (`5173`), du chatbot (`8001`) et de Strapi (`1337`) ne sont pas accessibles directement.

Lancer toute la stack, chatbot inclus :

```bash
make up
```

## Commandes utiles

```bash
make up                 # lance tous les services sans rebuild
make up-gateway         # lance uniquement la gateway
make up-front-cms       # lance PostgreSQL, Strapi et le frontend
make up-front-cms-stable # build l'admin puis lance le frontend + Strapi sans hot-reload Strapi
make up-frontend        # lance seulement le frontend
make up-chatbot         # lance seulement chatbot_backend
make up-strapi          # lance Strapi et PostgreSQL
make up-build           # rebuild puis lance tous les services
make build-no-chatbot   # build uniquement les images frontend
make build-kb           # genere l'index FAISS localement avec all-MiniLM
make down               # stoppe les services
make logs               # suit les logs
```

## Gateway Nginx

Le trafic local suit ce chemin :

```text
Navigateur -> Nginx :8080 -> Next.js :5173
                         -> Next /api/chat -> FastAPI :8001
                         -> Next /api/projects -> Strapi :1337

cms.localhost:8080 -> Nginx -> Strapi :1337
```

Nginx applique sur `/api/chat` :

- une limite de corps HTTP de `8 KiB`
- un rate limit de `5` requetes/minute avec `8` requetes immediates au maximum
- des timeouts de proxy
- la transmission controlee de l'adresse IP au limiteur Next.js

## Configuration Strapi

Apres le premier lancement :

1. Ouvrir `http://cms.localhost:8080/admin`
2. Creer le compte administrateur
3. Aller dans `Content Manager` puis `Project`
4. Creer et publier les projets
5. Aller dans `Settings -> Users & Permissions Plugin -> Roles -> Public`
6. Autoriser `find` et `findOne` pour `Project`

L'API Strapi appelee cote serveur par le frontend :

```text
/api/projects?populate=media&sort=date:desc
```

Le navigateur appelle la route Next locale `/api/projects`. Cette route appelle Strapi cote serveur via `STRAPI_INTERNAL_URL`.

## Modele Project

La collection Strapi `Project` contient :

- `name` : nom du projet
- `media` : image ou video
- `git_url` : lien GitHub
- `project_url` : lien public du projet
- `description` : description longue
- `date` : date du projet

Schema :

```text
cms/strapi/src/api/project/content-types/project/schema.json
```

## Chatbot et base de connaissance

Le dossier `kb/` n'est pas versionne pour eviter de publier des informations personnelles. Il sert uniquement a construire l'index localement.

Le backend runtime lit uniquement les artefacts FAISS dans :

```text
kb_faiss/kb.index.faiss
kb_faiss/kb.index.meta.json
```

Sans ces fichiers, chatbot_backend peut demarrer en erreur avec `FAISS index not found`.

La recherche FAISS utilise le modele local leger `sentence-transformers/all-MiniLM-L6-v2` :

```text
Question utilisateur -> all-MiniLM local -> vecteur -> FAISS -> extraits -> Groq
```

Pour construire l'index localement :

```bash
pip install -r kb/requirements.txt
make build-kb
```

Sur le VPS, tu n'as pas besoin du dossier `kb/`. Tu dois seulement deployer `kb_faiss/` avec les deux fichiers generes.

Le modele configure dans `EMBEDDING_MODEL` doit etre le meme au build de l'index et au runtime du backend. Si tu changes de modele, regenere `kb.index.faiss` et `kb.index.meta.json`.

Le premier lancement du backend peut telecharger le modele Hugging Face. Docker conserve ce cache dans le volume `chatbot_hf_cache`.

Le chatbot frontend appelle la route Next locale `/api/chat`. Cette route appelle `chatbot_backend` cote serveur via `CHATBOT_INTERNAL_URL`.

## Variables d'environnement

Le fichier `.env` est ignore par Git. Le modele versionne est :

```text
.env.example
```

Il contient les variables pour :

- Groq / chatbot
- Embedding local / RAG
- RAG / KB
- Strapi
- PostgreSQL

## Developpement frontend direct

```bash
cd frontend
npm install
npm run dev
```

Verification build :

```bash
cd frontend
npm run build
```

## Notes de securite

Ne sont pas pushes dans ce depot :

- `.env`
- `kb/`
- `kb_faiss/`
- videos locales lourdes
- uploads Strapi
- `node_modules`
- builds et caches

Le depot contient uniquement la configuration, le code applicatif, le schema Strapi, `.env.example` et les captures du README.

## Premier deploiement VPS

La production utilise la branche `main`. Le fichier `.env` et le dossier
`kb_faiss/` doivent etre installes separement sur le VPS.

Le reseau partage avec Nginx Proxy Manager doit deja exister :

```bash
docker network inspect proxy-network >/dev/null 2>&1 \
  || docker network create proxy-network
```

Valider puis lancer la nouvelle stack sans modifier l'ancien portfolio :

```bash
make prod-config
make prod-build
```

La gateway de test s'appelle `portfolio-next-gateway` et n'expose aucun port
sur l'hote. Une fois les tests termines, le Proxy Host `vloth.tech` dans Nginx
Proxy Manager peut pointer vers :

```text
Forward Hostname: portfolio-next-gateway
Forward Port: 80
```

## Deploiement automatique cible

Un push sur `main` lance le workflow GitHub Actions `Deploy production`.
Le workflow se connecte au VPS en SSH et execute :

```text
deploy <git-sha>
```

Le script cote VPS est :

```text
ops/github-deploy-portfolio
```

Avant optimisation, chaque deploiement faisait :

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Cette commande demandait a Docker Compose de repasser sur tous les services
qui ont une section `build`, notamment `frontend`, `chatbot_backend` et
`strapi`. Docker reutilise son cache, mais la passe de build reste globale.

Le script compare maintenant le commit deja deploye au commit pousse, puis
reconstruit seulement les services concernes :

| Fichiers modifies | Action |
| --- | --- |
| `frontend/**` | rebuild + recreate `frontend` uniquement |
| `chatbot_backend/**` | rebuild + recreate `chatbot_backend` uniquement |
| `cms/strapi/**` | rebuild + recreate `strapi` uniquement |
| `gateway/**` | recreate `gateway` uniquement |
| `docker-compose.prod.yml` | full deploy de toute la stack |
| docs, README, Makefile, fichiers CI | pas de rebuild container |

Pour une modification frontend simple, le VPS fait donc l'equivalent de :

```bash
docker compose -f docker-compose.prod.yml build frontend
docker compose -f docker-compose.prod.yml up -d --no-deps frontend
```

`--no-deps` evite de redemarrer PostgreSQL, Redis, Strapi ou le chatbot quand
ils n'ont pas change.

Apres chaque deploiement, meme cible, le script verifie les healthchecks des
services recrees et le healthcheck de la gateway.

Si le script `ops/github-deploy-portfolio` lui-meme est modifie, le changement
est versionne avec le depot, mais il ne peut s'appliquer qu'aux deploiements
suivants si le script deja lance etait l'ancienne version.
