"""
app/routers/auth.py
────────────────────
Authentication endpoints:
  POST /auth/signup  — register a new user
  POST /auth/login   — authenticate and receive JWT tokens
  GET  /auth/me      — return the current user's profile
  PUT  /auth/me      — update the current user's profile
"""

import logging
from datetime import datetime, timezone
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.core.database import get_db
from app.core.deps import get_active_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import (
    TokenResponse,
    UserCreate,
    UserInDB,
    UserLogin,
    UserResponse,
    UserUpdate,
)
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Helpers ────────────────────────────────────────────────────────────────────

_CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Incorrect email or password.",
    headers={"WWW-Authenticate": "Bearer"},
)


def _make_tokens(user_id: str) -> TokenResponse:
    """Create a paired access + refresh token for the given user_id."""
    return TokenResponse(
        access_token=create_access_token(subject=user_id),
        refresh_token=create_refresh_token(subject=user_id),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


# ── POST /auth/signup ──────────────────────────────────────────────────────────

@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    responses={
        409: {"description": "Email already registered"},
        422: {"description": "Validation error"},
    },
)
async def signup(
    payload: UserCreate,
    database=Depends(get_db),
) -> UserResponse:
    """
    Create a new user account.

    - **name**: display name (1–120 chars)
    - **email**: must be a valid, unique e-mail address
    - **password**: minimum 8 chars, must contain letters and digits
    """
    logger.info("Signup attempt for email=%s", payload.email)

    normalised_email = payload.email.lower().strip()

    # Explicit uniqueness check — works even when mongomock doesn't enforce indexes
    existing = await database["users"].find_one({"email": normalised_email})
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    doc = UserInDB(
        name=payload.name,
        email=normalised_email,
        password_hash=hash_password(payload.password),
    )

    # Serialise without the `_id` field so MongoDB generates its own ObjectId
    doc_dict = doc.model_dump(by_alias=True)
    doc_dict.pop("_id", None)  # always remove — even if Pydantic serialised it as None

    try:
        result = await database["users"].insert_one(doc_dict)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    doc.id = str(result.inserted_id)
    logger.info("New user created id=%s email=%s", doc.id, doc.email)
    return UserResponse.from_db(doc)


# ── POST /auth/login ───────────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and receive JWT tokens",
    responses={
        401: {"description": "Invalid credentials"},
        403: {"description": "Account deactivated"},
    },
)
async def login(
    payload: UserLogin,
    database=Depends(get_db),
) -> TokenResponse:
    """
    Authenticate with email + password.
    Returns an **access token** (60 min) and a **refresh token** (7 days).
    """
    normalised_login_email = payload.email.lower().strip()
    raw = await database["users"].find_one({"email": normalised_login_email})

    # Constant-time guard: always run bcrypt even when user is not found
    # to prevent user-enumeration via timing side-channel.
    _DUMMY_HASH = "$2b$12$KIXtoxDCGDPnJHKBBo8LwO3vbGOeZKlnMlKIE5H6z9B8N1rAmr5Yu"
    stored_hash = raw["password_hash"] if raw else _DUMMY_HASH

    pw_ok = verify_password(payload.password, stored_hash)

    if not pw_ok or raw is None:
        logger.warning("Failed login attempt for email=%s", payload.email)
        raise _CREDENTIALS_ERROR

    user = UserInDB.model_validate(raw)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact support.",
        )

    user_id = str(raw["_id"])
    logger.info("Successful login for user_id=%s", user_id)
    return _make_tokens(user_id)


# ── GET /auth/me ───────────────────────────────────────────────────────────────

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the current user's profile",
    responses={401: {"description": "Not authenticated"}},
)
async def get_me(
    current_user: Annotated[UserInDB, Depends(get_active_user)],
) -> UserResponse:
    """Return the full profile of the currently authenticated user."""
    return UserResponse.from_db(current_user)


# ── PUT /auth/me ───────────────────────────────────────────────────────────────

@router.put(
    "/me",
    response_model=UserResponse,
    summary="Update the current user's profile",
    responses={
        401: {"description": "Not authenticated"},
        422: {"description": "Validation error"},
    },
)
async def update_me(
    payload: UserUpdate,
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
) -> UserResponse:
    """
    Partially update the authenticated user's profile.
    Only the fields included in the request body are changed.
    """
    update_data = payload.model_dump(exclude_none=True)
    # Nested models must be serialised to plain dicts for MongoDB
    if "ai_config" in update_data:
        update_data["ai_config"] = payload.ai_config.model_dump()  # type: ignore[union-attr]
    if "notification_prefs" in update_data:
        update_data["notification_prefs"] = payload.notification_prefs.model_dump()  # type: ignore[union-attr]

    update_data["updated_at"] = datetime.now(timezone.utc)

    await database["users"].update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data},
    )

    # Re-fetch to return the updated document
    raw = await database["users"].find_one({"_id": ObjectId(current_user.id)})
    updated_user = UserInDB.model_validate(raw)
    logger.info("User updated id=%s fields=%s", current_user.id, list(update_data.keys()))
    return UserResponse.from_db(updated_user)
