"""
tests/test_health.py
────────────────────
Basic smoke test for the /health endpoint.
No DB connection required (lifespan is not triggered for test client by default).
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app, raise_server_exceptions=True)


def test_health_check() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_root() -> None:
    response = client.get("/")
    assert response.status_code == 200
