"""Route de résumé d'activité par utilisateur."""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Event
from ..schemas import UserSummary

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}/summary", response_model=UserSummary)
def user_summary(user_id: str, db: Session = Depends(get_db)) -> UserSummary:
    """Résumé d'activité. Utilisateur sans événement → total 0 (pas de 404)."""
    by_type = dict(
        db.execute(
            select(Event.type, func.count())
            .where(Event.user_id == user_id)
            .group_by(Event.type)
        ).all()
    )
    first_at, last_at = db.execute(
        select(func.min(Event.created_at), func.max(Event.created_at)).where(
            Event.user_id == user_id
        )
    ).one()

    return UserSummary(
        user_id=user_id,
        total=sum(by_type.values()),
        by_type=by_type,
        first_event_at=first_at,
        last_event_at=last_at,
    )
