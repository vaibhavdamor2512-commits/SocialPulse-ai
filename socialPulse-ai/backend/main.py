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

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import connect_db, close_db
from app.core.exceptions import register_exception_handlers
from app.core.logging_config import setup_logging

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


# ── Lifespan: startup / shutdown ───────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage database connections and logging across the application lifespan."""
    setup_logging()
    await connect_db()
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
