"""Schémas Pydantic d'entrée/sortie et enum des types d'événement."""

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class EventType(str, Enum):
    """Liste fermée des types d'événement (seul endroit qui valide le `type`)."""

    login = "login"
    transaction = "transaction"
    report = "report"


class EventCreate(BaseModel):
    user_id: str = Field(min_length=1)
    type: EventType
    payload: dict[str, Any] | None = None
    # Optionnel : sinon la base applique le défaut now().
    created_at: datetime | None = None

    @field_validator("created_at")
    @classmethod
    def created_at_not_in_future(cls, v: datetime | None) -> datetime | None:
        if v is None:
            return v
        # Un datetime naïf est supposé UTC pour la comparaison.
        moment = v if v.tzinfo else v.replace(tzinfo=timezone.utc)
        if moment > datetime.now(timezone.utc):
            raise ValueError("created_at ne peut pas être dans le futur")
        return v


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    type: EventType
    created_at: datetime
    payload: dict[str, Any] | None


class UserSummary(BaseModel):
    user_id: str
    total: int
    by_type: dict[EventType, int]
    first_event_at: datetime | None
    last_event_at: datetime | None
