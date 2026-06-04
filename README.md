# Mini API de suivi d'événements

> Réalisé par **Anas El Manssouri**.

Petite plateforme qui reçoit des **événements** liés à des utilisateurs, les stocke en PostgreSQL,
et expose une lecture simple de l'activité par utilisateur. Stack : **FastAPI**, **PostgreSQL 16**,
**React + Vite + TypeScript**, le tout en **Docker Compose**.

## Lancement

Prérequis : Docker + Docker Compose.

```bash
git clone https://github.com/iagoatbest26benbien/Test-piver.git
cd Test-piver
cp .env.example .env        # valeurs par défaut prêtes à l'emploi
docker compose up --build
```

- Front : http://localhost:3000
- API : http://localhost:8000
- Docs auto (Swagger) : http://localhost:8000/docs

Le premier démarrage joue `db/init.sql` (création de la table et des index). Les données sont
persistées dans un volume Docker nommé (`pgdata`) : elles survivent à `docker compose restart`
et à `docker compose down` (sans `-v`).

### Tests (bonus)

```bash
docker compose exec backend pytest
```

## Contrat d'API

- `POST /events` — crée un événement.
  Body : `{ "user_id": "u1", "type": "login", "payload": { ... } }` (`payload` et `created_at` optionnels).
  → **201** + l'événement créé. **422** si `type` hors liste ou champ manquant.
- `GET /events?user_id=&type=&limit=&offset=` — liste, filtres optionnels et combinables
  (pagination `limit` défaut 50, `offset` défaut 0), plus récents d'abord.
- `GET /users/{user_id}/summary` — résumé d'activité :
  ```json
  { "user_id": "u1", "total": 12, "by_type": {"login": 8, "transaction": 4},
    "first_event_at": "...", "last_event_at": "..." }
  ```
  Utilisateur sans événement → **200** avec `total: 0`, `by_type: {}`, dates `null` (pas de 404 :
  l'absence d'activité est une réponse valide).

Types d'événement (liste fermée) : `login`, `transaction`, `report`.

## Choix techniques

- **FastAPI** (imposé) + **SQLAlchemy 2.0** (mapping typé, mature) + **Pydantic v2** pour la
  validation. Dépendances via `requirements.txt` pour un build Docker simple et lisible.
- **Mode synchrone** (pas d'async) : 3 endpoints simples, aucun besoin de débit élevé →
  on garde le code minimal. Driver `psycopg2-binary`.
- **Schéma via `db/init.sql`** plutôt que des migrations : une seule source de vérité, lisible,
  jouée par Postgres au premier démarrage (`docker-entrypoint-initdb.d`). `models.py` reste aligné
  sur ce fichier (pas de `create_all` au runtime). Pour un projet de cette taille, un outil de
  migration serait over-kill.
- **Validation du `type`** centralisée dans l'enum Pydantic `EventType` (un seul endroit qui
  valide) ; une contrainte `CHECK` en base sert de défense supplémentaire.
- **Front** : React + Vite + TypeScript, une seule page, `fetch` natif (pas d'`axios` : une seule
  dépendance réseau en moins, le besoin est trivial). État local via hooks, pas de state manager.
- **Service du front via `vite preview`** sur le **build de production** (`vite build`), pas le
  serveur de dev et pas une image nginx dédiée. Le choix : `vite preview` sert le bundle statique
  déjà buildé en une seule commande, sans config serveur en plus — suffisant pour ce périmètre
  (une page, design non noté). Une image multi-stage nginx serait plus « prod » (compression, cache,
  process multiples) mais ce serait de la sur-ingénierie ici → choix assumé de rester simple. Pour
  un vrai déploiement, on passerait à nginx.
- **Config par variables d'environnement** uniquement (`DATABASE_URL`, `POSTGRES_*`, `CORS_ORIGINS`,
  `VITE_API_URL`), aucune variable en dur. `.env.example` fourni.
- **Point réseau important** : le navigateur tourne sur l'hôte, il joint donc l'API via le port
  mappé `http://localhost:8000` (`VITE_API_URL`, injecté au build du front), pas le hostname Docker
  interne. En conséquence, le CORS de l'API autorise `http://localhost:3000`.
- **Démarrage fiable** : `db` expose un healthcheck `pg_isready` et `backend` attend
  `condition: service_healthy` → `docker compose up` fonctionne sans étape manuelle ni course au
  démarrage.

## Structure du repo

```
.
├── docker-compose.yml         # 3 services : db, backend, frontend
├── .env.example
├── docker/
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── db/
│   └── init.sql               # schéma : table events, CHECK, index
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py            # app FastAPI, CORS, include routers
│   │   ├── config.py          # settings (env)
│   │   ├── database.py        # engine + session SQLAlchemy
│   │   ├── models.py          # modèle Event (aligné sur init.sql)
│   │   ├── schemas.py         # schémas Pydantic + enum EventType
│   │   └── routers/
│   │       ├── events.py      # POST /events, GET /events
│   │       └── users.py       # GET /users/{user_id}/summary
│   └── tests/                 # tests pytest (bonus)
└── frontend/
    └── src/                   # page unique React + wrapper fetch (api.ts)
```