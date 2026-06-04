"""Configuration de l'application, lue depuis l'environnement (aucun secret en dur)."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # URL de connexion SQLAlchemy vers Postgres (hostname interne `db` en Docker).
    database_url: str = "postgresql+psycopg2://piver:piver@db:5432/piver"
    # Origines autorisées par CORS, séparées par des virgules. Le navigateur tourne
    # sur l'hôte : il faut autoriser l'origine du front (http://localhost:3000).
    cors_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
