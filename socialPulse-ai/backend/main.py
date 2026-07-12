"""
SocialPulse AI — FastAPI Application Entry Point
=================================================
Responsibilities:
  - Create the FastAPI app instance
  - Register all routers under /api/v1
  - Configure CORS and global exception handlers
  - Manage application lifespan (DB connect/disconnect, logging)
  - Expose /health endpoint
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import connect_db, close_db, get_db
from app.core.exceptions import register_exception_handlers
from app.core.logging_config import setup_logging
from app.core.security import hash_password

# ── Phase 2: Auth router ───────────────────────────────────────────────────────
from app.routers import auth

# ── Phase 3: Feature routers ───────────────────────────────────────────────────
from app.routers import (
    analytics,
    assistant,
    campaigns,
    competitors,
    influencers,
    notifications,
    reports,
    trends,
)

_startup_logger = logging.getLogger(__name__)

# ── Demo user seed ─────────────────────────────────────────────────────────────
_DEMO_EMAIL    = "demo@socialpulse.ai"
_DEMO_PASSWORD = "Demo1234!"
_DEMO_NAME     = "Demo User"


async def _seed_demo_user() -> None:
    """Create the demo user if it doesn't already exist."""
    db = get_db()
    existing = await db["users"].find_one({"email": _DEMO_EMAIL})
    if existing is not None:
        _startup_logger.info("Demo user already exists — skipping seed.")
        return
    from datetime import datetime, timezone
    doc = {
        "name": _DEMO_NAME,
        "email": _DEMO_EMAIL,
        "password_hash": hash_password(_DEMO_PASSWORD),
        "plan": "free",
        "avatar_url": None,
        "connected_platforms": [],
        "ai_config": {
            "model": "ibm/granite-13b-instruct-v2",
            "temperature": 0.7,
            "language": "en",
            "max_tokens": 1024,
        },
        "notification_prefs": {
            "email_alerts": True,
            "viral_predictions": True,
            "campaign_updates": True,
            "competitor_alerts": False,
            "weekly_digest": True,
        },
        "is_active": True,
        "is_verified": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    await db["users"].insert_one(doc)
    _startup_logger.info("Demo user created: %s / %s", _DEMO_EMAIL, _DEMO_PASSWORD)


# ── Lifespan: startup / shutdown ───────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage database connections and logging across the application lifespan."""
    setup_logging()
    await connect_db()
    await _seed_demo_user()
    yield
    await close_db()


# ── App factory ────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Intelligent Social Media Agent — IBM AI Hackathon 2024\n\n"
        "Powered by IBM Granite 13B · IBM Langflow · IBM Watson NLP"
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ── CORS middleware ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global exception handlers ──────────────────────────────────────────────────
register_exception_handlers(app)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth.router,          prefix="/api/v1/auth",          tags=["Auth"])
app.include_router(analytics.router,     prefix="/api/v1/analytics",     tags=["Analytics"])
app.include_router(assistant.router,     prefix="/api/v1/assistant",     tags=["Assistant"])
app.include_router(campaigns.router,     prefix="/api/v1/campaigns",     tags=["Campaigns"])
app.include_router(competitors.router,   prefix="/api/v1/competitors",   tags=["Competitors"])
app.include_router(influencers.router,   prefix="/api/v1/influencers",   tags=["Influencers"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(reports.router,       prefix="/api/v1/reports",       tags=["Reports"])
app.include_router(trends.router,        prefix="/api/v1/trends",        tags=["Trends"])


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], include_in_schema=False)
async def health_check() -> JSONResponse:
    return JSONResponse(content={"status": "ok", "version": settings.APP_VERSION})


# ── Root ───────────────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root() -> JSONResponse:
    return JSONResponse(content={"message": "SocialPulse AI API", "docs": "/docs"})
