"""Tests de l'endpoint /users/{user_id}/summary."""

from fastapi.testclient import TestClient


def test_summary_aggregates_events(client: TestClient):
    client.post("/events", json={"user_id": "u1", "type": "login"})
    client.post("/events", json={"user_id": "u1", "type": "login"})
    client.post("/events", json={"user_id": "u1", "type": "transaction"})

    body = client.get("/users/u1/summary").json()
    assert body["user_id"] == "u1"
    assert body["total"] == 3
    assert body["by_type"] == {"login": 2, "transaction": 1}
    assert body["first_event_at"] is not None
    assert body["last_event_at"] is not None


def test_summary_unknown_user_returns_empty(client: TestClient):
    res = client.get("/users/inconnu/summary")
    assert res.status_code == 200
    body = res.json()
    assert body["total"] == 0
    assert body["by_type"] == {}
    assert body["first_event_at"] is None
    assert body["last_event_at"] is None
