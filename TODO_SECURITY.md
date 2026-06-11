# TODO securite et deploiement

## Priorite 1 - Securiser l'application en local

- [x] Mettre Next.js a jour vers une version maintenue et corrigee.
- [x] Executer `npm audit` apres la mise a jour et traiter les vulnerabilites restantes.
- [x] Limiter les messages du chatbot a 1 000 caracteres dans Next.js et FastAPI.
- [x] Supprimer le champ `history` de la route du chatbot puisqu'il n'est plus utilise.
- [x] Limiter la taille du corps des requetes HTTP.
- [x] Limiter localement `/api/chat` a 5 requetes par minute avec 8 requetes immediates au maximum.
- [x] Appliquer `GROQ_TIMEOUT_SECONDS` aux appels Groq.
- [ ] Limiter chaque reponse Groq avec `max_completion_tokens`.
- [x] Limiter le nombre d'appels Groq simultanes.
- [ ] Ne plus retourner le texte complet des chunks dans `sources`.
- [ ] Verifier que la reponse publique ne contient que les donnees utiles au frontend.
- [ ] Ajouter un token interne entre Next.js et `chatbot_backend`.
- [ ] Refuser dans FastAPI les requetes sans token interne valide.
- [ ] Desactiver `/docs`, `/redoc` et `/openapi.json` en production.
- [x] Ajouter des regles contre les prompt injections dans le prompt systeme.
- [x] Filtrer les questions avec Prompt Guard 86M et utiliser 22M uniquement en fallback sur une erreur `429`.
- [ ] Restreindre les images du chatbot aux chemins locaux et aux domaines autorises.

## Priorite 2 - Durcir Docker

- [x] Retirer les ports publics locaux du frontend, du chatbot, de Strapi et de PostgreSQL.
- [x] Garder le frontend, le chatbot, Strapi et PostgreSQL sur le reseau Docker prive.
- [x] Ne publier localement que le port de la gateway Nginx.
- [ ] Executer le frontend et le chatbot avec des utilisateurs non-root.
- [ ] Ajouter `security_opt: no-new-privileges:true` aux services compatibles.
- [ ] Supprimer les capabilities Linux inutiles avec `cap_drop`.
- [ ] Monter les volumes sensibles en lecture seule lorsque possible.
- [x] Utiliser `npm ci` dans les images Docker.
- [ ] Verrouiller les versions Python avec des versions exactes.
- [x] Ajouter des healthchecks au frontend, au chatbot et a Strapi.
- [x] Ajouter `restart: unless-stopped` aux services de production.

## Priorite 3 - Configuration de production

- [x] Creer un fichier `docker-compose.prod.yml`.
- [x] Lancer Next.js avec `next start`, jamais avec `next dev`.
- [x] Lancer Strapi en mode production.
- [x] Retirer les volumes de code et le polling utilises pour le developpement.
- [ ] Utiliser des secrets differents pour Groq, Strapi, PostgreSQL et le token interne.
- [ ] Generer des secrets longs et aleatoires pour Strapi.
- [ ] Ne jamais copier `.env`, `kb` ou des donnees privees dans une image Docker.
- [ ] Verifier les permissions du fichier `.env` sur le VPS.
- [ ] Sauvegarder regulierement PostgreSQL et les uploads Strapi.
- [ ] Tester la restauration des sauvegardes.

## Priorite 4 - Gateway Nginx et Nginx Proxy Manager sur le VPS

- [x] Ajouter une gateway Nginx versionnee devant les services du projet.
- [x] Faire passer `/api/chat` et `/api/projects` par Next.js, sans exposer FastAPI ou Strapi directement.
- [x] Relier la gateway au reseau Docker externe `proxy-network` de Nginx Proxy Manager.
- [x] Ne publier aucun port applicatif depuis la stack du portfolio.
- [ ] Configurer le domaine vers le service gateway.
- [ ] Activer un certificat Let's Encrypt.
- [ ] Activer `Force SSL`, HTTP/2 et HSTS.
- [ ] Ajouter une limite de requetes par IP sur `/api/chat`.
- [ ] Ajouter une limite globale pour proteger le quota Groq.
- [ ] Limiter la taille des requetes HTTP.
- [ ] Ajouter les headers CSP, `X-Content-Type-Options`, `Referrer-Policy` et `Permissions-Policy`.
- [ ] Proteger l'administration Strapi par restriction IP, Access List ou VPN.
- [ ] Ne pas exposer directement PostgreSQL, Strapi ou le chatbot sur Internet.

## Priorite 5 - Tests avant ouverture publique

- [ ] Verifier que `8001`, `1337` et `5432` sont inaccessibles depuis Internet.
- [ ] Tester le rate limiting et verifier la reponse HTTP `429`.
- [ ] Tester un message vide, trop long et un corps JSON invalide.
- [ ] Tester les timeouts lorsque Groq est indisponible.
- [ ] Tester plusieurs requetes simultanees.
- [ ] Tester des tentatives de prompt injection.
- [ ] Verifier que le chatbot ne revele ni prompt systeme, ni secret, ni chunk brut.
- [ ] Verifier que les liens et images generes utilisent uniquement des URLs autorisees.
- [ ] Executer `npm audit` et un audit des dependances Python.
- [ ] Examiner les logs pour verifier qu'aucun secret ou contenu prive n'est enregistre.
- [ ] Verifier que `.env`, `kb` et `kb_faiss` restent ignores par Git.

## Evolution optionnelle de la gateway

- [ ] Reevaluer Kong, APISIX ou KrakenD uniquement si plusieurs clients, des cles API ou du versionnement centralise deviennent necessaires.
- [ ] Conserver Nginx tant que le besoin reste du reverse proxy, du rate limiting et de l'isolation reseau.
