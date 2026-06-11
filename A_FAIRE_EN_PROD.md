# A faire en production

## Architecture reseau

- [x] Preparer Nginx Proxy Manager devant le service `gateway`, jamais devant le frontend directement.
- [x] Partager le reseau Docker externe `proxy-network` entre Nginx Proxy Manager et `gateway`.
- [ ] Ne publier sur Internet que les ports `80` et `443` de Nginx Proxy Manager.
- [x] Ne pas publier directement les ports du frontend, du chatbot, de Strapi et de PostgreSQL.
- [x] Ne pas publier le port `8080` de `gateway` sur le VPS ; Nginx Proxy Manager doit le joindre par le reseau Docker.
- [ ] Configurer un domaine principal vers `gateway:80`.
- [ ] Configurer un sous-domaine CMS protege vers `gateway:80` avec le bon header `Host`.

## Rate limiting du chatbot

- [x] Appliquer le rate limit et `client_max_body_size 8k` dans la gateway versionnee.
- [x] Activer `CHAT_RATE_LIMIT_TRUST_PROXY_HEADERS=true` puisque Next.js n'est plus publie directement.
- [ ] Faire transmettre l'IP cliente par Nginx Proxy Manager a la gateway.
- [ ] Verifier que la gateway remplace les headers recus avant de les transmettre a Next.js.
- [ ] Tester que la neuvieme requete immediate vers `/api/chat` renvoie `HTTP 429`.
- [ ] Conserver le limiteur Next.js comme seconde protection.
- [ ] Conserver la limite de deux pipelines simultanes dans FastAPI.

## Limites de la protection locale

- Le compteur Next.js est stocke en memoire et est remis a zero au redemarrage.
- Il n'est pas partage entre plusieurs conteneurs ou plusieurs workers Next.js.
- Redis ne devient necessaire que si plusieurs instances du frontend doivent partager les memes quotas.
- La gateway ne doit faire confiance qu'au proxy de production connu pour retrouver l'IP reelle. Sa configuration devra etre durcie avec `set_real_ip_from` et `real_ip_header`.

## Verification avant ouverture

- [ ] Tester le site uniquement via son nom de domaine HTTPS.
- [ ] Verifier que les ports `5173`, `8001`, `1337`, `5432` et `8080` sont fermes depuis Internet.
- [ ] Verifier les reponses `429`, `413`, `503` et leurs messages.
- [ ] Surveiller les quotas Groq apres la mise en ligne.
