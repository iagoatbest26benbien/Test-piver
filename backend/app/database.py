"""Engine et session SQLAlchemy, plus la dépendance FastAPI de session."""

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Iterator[Session]:
    """Fournit une session par requête, fermée à la fin."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
