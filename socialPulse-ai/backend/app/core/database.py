"""
app/core/database.py
────────────────────
Async MongoDB connection management using Motor.
Exposes a module-level `db` reference used by all routers.
"""

import logging
from typing import Optional

import motor.motor_asyncio
from pymongo import IndexModel, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Module-level client & db references ────────────────────────────────────────
_client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None  # type: ignore[type-arg]
db: Optional[motor.motor_asyncio.AsyncIOMotorDatabase] = None  # type: ignore[type-arg]


async def connect_db() -> None:
    """Open the Motor connection and verify it with a ping."""
    global _client, db
    logger.info("Connecting to MongoDB at %s …", settings.MONGODB_URL)
    _client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.MONGODB_URL,
        maxPoolSize=settings.MONGODB_MAX_CONNECTIONS,
        minPoolSize=settings.MONGODB_MIN_CONNECTIONS,
        serverSelectionTimeoutMS=5000,
    )
    db = _client[settings.MONGODB_DB_NAME]
    # Verify connection
    await _client.admin.command("ping")
    logger.info("MongoDB connected — database: '%s'", settings.MONGODB_DB_NAME)


async def close_db() -> None:
    """Close the Motor connection gracefully."""
    global _client
    if _client is not None:
        _client.close()
        logger.info("MongoDB connection closed.")


def get_db() -> motor.motor_asyncio.AsyncIOMotorDatabase:  # type: ignore[type-arg]
    """
    FastAPI dependency that returns the current database instance.

    Usage in a router:
        from fastapi import Depends
        from app.core.database import get_db

        @router.get("/")
        async def list_items(database=Depends(get_db)):
            ...
    """
    if db is None:
        raise ConnectionFailure("Database not initialised. Was connect_db() called?")
    return db
