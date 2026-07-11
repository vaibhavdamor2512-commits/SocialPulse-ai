"""
app/core/deps.py
────────────────
FastAPI dependency functions shared across routers.

  get_current_user  — validates Bearer JWT and returns the UserInDB document
  get_active_user   — additionally checks is_active == True
"""

import logging
from typing import Annotated

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import UserInDB

logger = logging.getLogger(__name__)

# ── Bearer scheme (auto_error=False lets us return a cleaner 401) ──────────────
_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    database=Depends(get_db),
) -> UserInDB:
    """
    Extract and validate the JWT from the Authorization header.
    Returns the full UserInDB document from MongoDB.
    Raises HTTP 401 on any auth failure.
    """
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exc

    try:
        payload = decode_token(credentials.credentials)
    except JWTError as exc:
        logger.debug("JWT decode failed: %s", exc)
        raise credentials_exc from exc

    if payload.get("type") != "access":
        raise credentials_exc

    user_id: str | None = payload.get("sub")
    if not user_id or not ObjectId.is_valid(user_id):
        raise credentials_exc

    raw = await database["users"].find_one({"_id": ObjectId(user_id)})
    if raw is None:
        raise credentials_exc

    return UserInDB.model_validate(raw)


async def get_active_user(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
) -> UserInDB:
    """Like get_current_user but also asserts the account is active."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact support.",
        )
    return current_user
