# Valentin Loth Portfolio Frontend

Frontend principal du projet, basé sur Next.js.

## Lancer en local

Depuis la racine du repo :

```bash
make up-front-cms
```

URL :

```text
http://localhost:8080
```

Le port Next.js `5173` reste interne a Docker. Le navigateur passe par la gateway Nginx.

## Strapi

La page `HUB` récupère les projets via la route Next `/api/projects`, qui appelle Strapi côté serveur.

Si les permissions publiques Strapi sont fermées, ajoute un token read-only dans le `.env` racine :

```env
STRAPI_API_TOKEN=your_read_only_token
```
