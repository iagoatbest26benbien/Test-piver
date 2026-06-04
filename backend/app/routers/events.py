"""Routes des événements : création et listing."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Event
from ..schemas import EventCreate, EventOut, EventType

router = APIRouter(prefix="/events", tags=["events"])


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, db: Session = Depends(get_db)) -> Event:
    """Crée un événement. 422 automatique si `type` hors enum ou champ manquant."""
    event = Event(
        user_id=payload.user_id,
        type=payload.type.value,
        payload=payload.payload,
    )
    # created_at est optionnel : sinon la base applique son défaut now().
    if payload.created_at is not None:
        event.created_at = payload.created_at

    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("", response_model=list[EventOut])
def list_events(
    db: Session = Depends(get_db),
    user_id: str | None = None,
    type: EventType | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[Event]:
    """Liste les événements, filtres optionnels et combinables, plus récents d'abord."""
    stmt = select(Event)
    if user_id:
        stmt = stmt.where(Event.user_id == user_id)
    if type:
        stmt = stmt.where(Event.type == type.value)
    stmt = stmt.order_by(Event.created_at.desc(), Event.id.desc()).limit(limit).offset(offset)
    return list(db.scalars(stmt).all())
