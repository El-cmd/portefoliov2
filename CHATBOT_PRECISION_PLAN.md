# Plan d'amelioration de la precision du chatbot

Ce fichier liste ce qu'il faut ajouter ou modifier pour rendre le chatbot plus fiable, plus precis et plus stable dans ses reponses.

## Diagnostic actuel

Le chatbot utilise ce pipeline :

```text
Question utilisateur
-> embedding local
-> recherche FAISS
-> extraits Markdown
-> LLM Groq
-> reponse
```

Les points faibles actuels sont :

- Les intentions du routeur RAG doivent rester alignees avec les fichiers KB reellement utilises.
- Le modele d'embedding actuel est leger et pas ideal pour du contenu principalement francais.
- Le seuil de pertinence peut laisser passer des extraits moyens.
- Le chatbot ne conserve pas le contexte des questions precedentes.
- Les tests actuels verifient surtout que l'API repond, pas que la reponse est factuellement correcte.

## Priorite 1 - Nettoyer le routage RAG

Les fichiers KB actuels peuvent rester :

```text
kb/about.md
kb/contact.md
kb/projects.md
kb/skills.md
```

Le point important est d'aligner `rag_service.py` avec cette organisation.

Actions conseillees :

1. Router les questions "services" et "prestations" vers `skills.md`.
2. Router les questions "tarifs", "prix" et "devis" vers `contact.md` et `skills.md`.
3. Router les questions "process", "methode", "livraison" et "maintenance" vers `about.md` et `contact.md`.
4. Ajouter les informations utiles directement dans `skills.md`, `about.md` ou `contact.md`.

Exemple d'organisation sans nouveaux fichiers :

```markdown
<!-- kb/skills.md -->

## Services possibles
- Sites vitrines
- Landing pages
- APIs backend
- Chatbots IA RAG
- Deploiement Docker / VPS / Nginx

## Prestations non couvertes
- Pas de promesse de resultat SEO garantie
- Pas de conseil juridique ou comptable

<!-- kb/contact.md -->

## Devis et tarifs
Les tarifs dependent du perimetre. Pour un prix exact, proposer /contact.
```

Exemple de modification logique :

```python
if any(marker in normalized for marker in ("service", "prestation", "tarif", "prix", "devis", "cout")):
    return {"skills.md", "contact.md"}

if any(marker in normalized for marker in ("process", "methode", "etape", "livraison", "maintenance")):
    return {"about.md", "contact.md"}
```

## Priorite 2 - Utiliser un embedding multilingue

Le modele actuel est :

```text
sentence-transformers/all-MiniLM-L6-v2
```

Il est rapide, mais pas optimal pour une base en francais.

Modele recommande :

```text
intfloat/multilingual-e5-base
```

Actions :

1. Modifier `EMBEDDING_MODEL` dans `.env` et `.env.example`.
2. Regenerer l'index FAISS.
3. Verifier que le backend utilise exactement le meme modele que l'index.

Commande :

```bash
EMBEDDING_MODEL=intfloat/multilingual-e5-base make build-kb
```

Attention : si le modele de l'index et le modele runtime sont differents, le backend refusera de demarrer.

## Priorite 3 - Regler les parametres RAG

Parametres actuels importants :

```env
KB_TOP_K=4
KB_MIN_SCORE=0.2
GROQ_TEMPERATURE=0.2
```

Valeurs a tester :

```env
KB_TOP_K=3
KB_MIN_SCORE=0.35
GROQ_TEMPERATURE=0.1
```

Objectif :

- Reduire les extraits hors sujet.
- Forcer le chatbot a dire qu'il ne sait pas quand la base ne contient pas la reponse.
- Diminuer la creativite du LLM pour limiter les inventions.

## Priorite 4 - Ajouter une evaluation automatique

Le fichier `QUESTIONS_CHATBOT.md` contient deja de bonnes questions de test.

Il faut ajouter un fichier d'attentes, par exemple :

```text
EVAL_CHATBOT.json
```

Exemple de format :

```json
[
  {
    "category": "Contact",
    "question": "Comment te contacter ?",
    "expected_sources": ["contact.md"],
    "required_terms": ["lothvalentin@gmail.com", "+33"],
    "forbidden_terms": ["je ne dispose pas"]
  }
]
```

Puis faire evoluer `test_chatbot_categories.py` pour verifier :

- la source utilisee ;
- les informations obligatoires ;
- les hallucinations evidentes ;
- les erreurs HTTP ;
- les reponses trop longues.

## Priorite 5 - Gerer les questions de suivi

Probleme actuel :

Une question comme :

```text
Et pour le backend ?
```

arrive seule au backend. Le chatbot ne sait pas si l'utilisateur parle des competences, des services, des projets ou des tarifs.

Amelioration :

- Envoyer les 4 a 6 derniers messages depuis le frontend.
- Ajouter une etape de reformulation avant la recherche FAISS.

Exemple :

```text
Historique :
Utilisateur : Quelles sont tes competences ?
Assistant : ...
Utilisateur : Et pour le backend ?

Question reformulee :
Quelles sont les competences backend de Valentin ?
```

## Priorite 6 - Ajouter un reranker

Pipeline cible :

```text
FAISS top 10
-> reranker
-> top 3 extraits
-> LLM
```

Avantage :

- FAISS recupere large.
- Le reranker choisit les extraits vraiment utiles.
- Moins besoin de bonus manuels dans `rag_service.py`.

Option possible :

```text
BAAI/bge-reranker-v2-m3
```

Cette etape est plus lourde que le simple changement d'embedding, donc a faire apres les priorites 1 a 4.

## Priorite 7 - Nettoyer les regles manuelles

`chatbot_backend/app/services/rag_service.py` contient beaucoup de logique de ranking par mots-cles.

Ces regles sont utiles, mais elles deviennent fragiles quand la base grandit.

Apres ajout d'un meilleur embedding et d'un reranker :

- supprimer les bonus trop specifiques ;
- garder seulement les redirections evidentes par source ;
- documenter chaque regle restante.

## Checklist de mise en oeuvre

Ordre conseille :

1. Nettoyer le routage vers les fichiers KB reellement utilises.
2. Ajouter les informations manquantes dans `skills.md`, `about.md`, `contact.md` ou `projects.md`.
3. Regenerer `kb_faiss`.
4. Tester les questions de `QUESTIONS_CHATBOT.md`.
5. Passer a `intfloat/multilingual-e5-base`.
6. Regenerer `kb_faiss` a nouveau.
7. Ajuster `KB_TOP_K` et `KB_MIN_SCORE`.
8. Ajouter `EVAL_CHATBOT.json`.
9. Ajouter la memoire conversationnelle.
10. Ajouter un reranker si la precision reste insuffisante.

## Definition d'une bonne reponse

Une reponse correcte doit :

- etre basee sur les extraits recuperes ;
- citer implicitement les faits de la base, sans invention ;
- rester courte ;
- proposer `/contact` quand il manque une information ;
- inclure les blocs `ui` quand ils sont utiles ;
- ne pas lister tout le portfolio si la question demande une information precise.

## Commandes utiles

Construire l'index :

```bash
make build-kb
```

Lancer le chatbot :

```bash
make up-chatbot
```

Tester les questions :

```bash
python3 test_chatbot_categories.py --url http://localhost:8001/chat
```

Deployer apres modification de l'index :

```bash
git add kb_faiss CHATBOT_PRECISION_PLAN.md
git commit -m "Improve chatbot knowledge base precision"
git push origin main
```
