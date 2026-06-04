"""Routes des événements : création et listing."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Event
from ..schemas import EventCreate, EventOut

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
