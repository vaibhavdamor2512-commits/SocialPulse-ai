"""
tests/conftest.py
──────────────────
Shared pytest fixtures:
  - async_client   : HTTPX AsyncClient with the FastAPI app (no real DB needed)
  - mongo_mock     : mongomock-motor in-memory database injected via dependency override
"""

import os

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

os.environ.setdefault(
    "SECRET_KEY",
    "testsecretkeymustbe32characters!!",
)

from main import app
from app.core.database import get_db


# ── In-memory MongoDB mock ─────────────────────────────────────────────────────
# We use mongomock-motor so tests run without a real MongoDB instance.
# Add "mongomock-motor==0.0.21" to requirements.txt (dev section) if not present.
try:
    import mongomock_motor

    @pytest.fixture
    def mock_db():
        """Return a mongomock-motor in-memory database."""
        client = mongomock_motor.AsyncMongoMockClient()
        database = client["test_socialpulse"]
        return database

    @pytest_asyncio.fixture
    async def async_client(mock_db):
        """HTTPX async client with the mock DB injected."""
        app.dependency_overrides[get_db] = lambda: mock_db
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            yield ac
        app.dependency_overrides.clear()

except ImportError:
    # Fallback: use real httpx TestClient (requires a running MongoDB)
    @pytest_asyncio.fixture
    async def async_client():
        """Fallback async client without DB override (requires real MongoDB)."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            yield ac
