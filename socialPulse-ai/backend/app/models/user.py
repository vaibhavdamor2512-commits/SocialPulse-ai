"""
app/models/user.py
──────────────────
All Pydantic models for the User domain:
  - UserInDB     : the full document stored in MongoDB (never sent to client)
  - UserCreate   : request body for POST /auth/signup
  - UserLogin    : request body for POST /auth/login
  - UserResponse : safe public response (no password_hash)
  - UserUpdate   : request body for PUT /auth/me
  - TokenResponse: response body for POST /auth/login
  - TokenData    : extracted claims from a decoded JWT
"""

from datetime import datetime, timezone
from typing import Annotated, Any, List, Optional

from bson import ObjectId
from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    EmailStr,
    Field,
    field_serializer,
    field_validator,
    model_validator,
)


# ── ObjectId helper ────────────────────────────────────────────────────────────
def _coerce_object_id(v: Any) -> str:
    """Pydantic v2 BeforeValidator: coerce ObjectId or valid string to str."""
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str) and ObjectId.is_valid(v):
        return v
    if v is None:
        return v  # type: ignore[return-value]
    raise ValueError(f"Invalid ObjectId: {v!r}")


# Use Annotated + BeforeValidator (Pydantic v2 compatible)
PyObjectId = Annotated[Optional[str], BeforeValidator(_coerce_object_id)]


# ── Embedded models ────────────────────────────────────────────────────────────

class AIConfig(BaseModel):
    """Per-user IBM Granite configuration."""

    model_config = ConfigDict(populate_by_name=True)

    model: str = "ibm/granite-13b-instruct-v2"
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)
    language: str = "en"
    max_tokens: int = Field(default=1024, ge=64, le=4096)


class NotificationPrefs(BaseModel):
    """User notification preferences."""

    email_alerts: bool = True
    viral_predictions: bool = True
    campaign_updates: bool = True
    competitor_alerts: bool = False
    weekly_digest: bool = True


# ── Platform literal ───────────────────────────────────────────────────────────
Platform = Annotated[str, Field(pattern="^(instagram|twitter|linkedin|facebook)$")]


# ── Database document ──────────────────────────────────────────────────────────

class UserInDB(BaseModel):
    """
    Exact shape stored in the `users` MongoDB collection.
    The `id` field maps to the MongoDB `_id` field.
    """

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    password_hash: str
    plan: str = Field(default="free", pattern="^(free|pro|enterprise)$")
    avatar_url: Optional[str] = None
    connected_platforms: List[Platform] = Field(default_factory=list)
    ai_config: AIConfig = Field(default_factory=AIConfig)
    notification_prefs: NotificationPrefs = Field(default_factory=NotificationPrefs)
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_serializer("id")
    def serialize_id(self, v: Optional[PyObjectId]) -> Optional[str]:
        return str(v) if v else None


# ── Request bodies ─────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    """POST /auth/signup request body."""

    name: str = Field(..., min_length=1, max_length=120, examples=["Jane Doe"])
    email: EmailStr = Field(..., examples=["jane@example.com"])
    password: str = Field(..., min_length=8, max_length=128, examples=["securepass123"])

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if v.isdigit():
            raise ValueError("Password must contain at least one letter.")
        if v.isalpha():
            raise ValueError("Password must contain at least one digit.")
        return v

    @field_validator("name")
    @classmethod
    def name_strip(cls, v: str) -> str:
        return v.strip()


class UserLogin(BaseModel):
    """POST /auth/login request body."""

    email: EmailStr = Field(..., examples=["jane@example.com"])
    password: str = Field(..., min_length=1, examples=["securepass123"])


class UserUpdate(BaseModel):
    """PUT /auth/me request body — all fields optional."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    avatar_url: Optional[str] = Field(default=None, max_length=512)
    connected_platforms: Optional[List[Platform]] = None
    ai_config: Optional[AIConfig] = None
    notification_prefs: Optional[NotificationPrefs] = None

    @model_validator(mode="after")
    def at_least_one_field(self) -> "UserUpdate":
        provided = {k: v for k, v in self.model_dump().items() if v is not None}
        if not provided:
            raise ValueError("At least one field must be provided for an update.")
        return self


# ── Response bodies ────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """
    Safe public user representation — password_hash excluded.
    Returned by GET /auth/me and POST /auth/signup.
    """

    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    email: str
    plan: str
    avatar_url: Optional[str]
    connected_platforms: List[str]
    ai_config: AIConfig
    notification_prefs: NotificationPrefs
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_db(cls, doc: UserInDB) -> "UserResponse":
        """Construct a UserResponse from a UserInDB document."""
        return cls(
            id=str(doc.id) if doc.id else "",
            name=doc.name,
            email=doc.email,
            plan=doc.plan,
            avatar_url=doc.avatar_url,
            connected_platforms=list(doc.connected_platforms),
            ai_config=doc.ai_config,
            notification_prefs=doc.notification_prefs,
            is_active=doc.is_active,
            is_verified=doc.is_verified,
            created_at=doc.created_at,
            updated_at=doc.updated_at,
        )


class TokenResponse(BaseModel):
    """POST /auth/login response body."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class TokenData(BaseModel):
    """Claims extracted from a decoded JWT for use in dependencies."""

    user_id: str
    token_type: str = "access"
