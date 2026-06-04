"""Tests des endpoints /events."""

from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient


def test_create_event_returns_201(client: TestClient):
    res = client.post(
        "/events",
        json={"user_id": "u1", "type": "login", "payload": {"ip": "10.0.0.1"}},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["id"] > 0
    assert body["user_id"] == "u1"
    assert body["type"] == "login"
    assert body["payload"] == {"ip": "10.0.0.1"}
    assert body["created_at"] is not None


def test_create_event_invalid_type_returns_422(client: TestClient):
    res = client.post("/events", json={"user_id": "u1", "type": "logout"})
    assert res.status_code == 422


def test_create_event_future_created_at_returns_422(client: TestClient):
    future = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    res = client.post(
        "/events",
        json={"user_id": "u1", "type": "login", "created_at": future},
    )
    assert res.status_code == 422


def test_list_events_filters_by_user_and_type(client: TestClient):
    client.post("/events", json={"user_id": "u1", "type": "login"})
    client.post("/events", json={"user_id": "u1", "type": "transaction"})
    client.post("/events", json={"user_id": "u2", "type": "login"})

    assert len(client.get("/events").json()) == 3
    assert len(client.get("/events?user_id=u1").json()) == 2
    assert len(client.get("/events?type=login").json()) == 2

    combined = client.get("/events?user_id=u1&type=login").json()
    assert len(combined) == 1
    assert combined[0]["user_id"] == "u1"
    assert combined[0]["type"] == "login"
