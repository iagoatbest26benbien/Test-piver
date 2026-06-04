"""Fixtures de test : client FastAPI sur une base Postgres **dédiée aux tests**.

Les tests ne touchent jamais la base de dev : on dérive une base `…_test` à partir
de DATABASE_URL, créée à la volée si besoin, et on y redirige la dépendance `get_db`.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.database import Base, get_db
from app.main import app

# Base de test dérivée : …/piver → …/piver_test.
_url = make_url(settings.database_url)
_test_url = _url.set(database=f"{_url.database or 'piver'}_test")


def _ensure_test_database() -> None:
    # CREATE DATABASE ne peut pas tourner dans une transaction → AUTOCOMMIT.
    admin = create_engine(_url.set(database="postgres"), isolation_level="AUTOCOMMIT")
    with admin.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"),
            {"name": _test_url.database},
        ).scalar()
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{_test_url.database}"'))
    admin.dispose()


_ensure_test_database()
test_engine = create_engine(_test_url)
TestSessionLocal = sessionmaker(bind=test_engine, autoflush=False, expire_on_commit=False)


def _get_test_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


# L'API utilise la base de test au lieu de la base de dev.
app.dependency_overrides[get_db] = _get_test_db


@pytest.fixture(autouse=True)
def clean_db():
    # La base de test n'a pas joué init.sql : create_all crée le schéma.
    Base.metadata.create_all(bind=test_engine)
    with test_engine.begin() as conn:
        conn.execute(text("TRUNCATE events RESTART IDENTITY"))
    yield


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
