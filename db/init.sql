-- Schéma de la base : source de vérité du modèle de données.
-- Joué une seule fois par Postgres au premier démarrage (docker-entrypoint-initdb.d),
-- sur un volume vide. models.py côté API doit rester aligné sur cette table.

CREATE TABLE IF NOT EXISTS events (
    id          serial      PRIMARY KEY,
    user_id     varchar     NOT NULL,
    -- Liste fermée validée d'abord côté API (enum Pydantic) ; CHECK en défense.
    type        varchar     NOT NULL CHECK (type IN ('login', 'transaction', 'report')),
    created_at  timestamptz NOT NULL DEFAULT now(),
    payload     jsonb
);

-- Index pour les filtres (GET /events) et le résumé par utilisateur.
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events (user_id);
CREATE INDEX IF NOT EXISTS idx_events_type    ON events (type);
