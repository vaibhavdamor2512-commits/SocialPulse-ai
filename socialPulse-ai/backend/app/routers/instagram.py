"""
app/routers/instagram.py
─────────────────────────
Instagram Graph API endpoints — data stays server-side.

  GET /instagram/profile   → username, followers, media_count
  GET /instagram/media     → recent posts with likes/comments
  GET /instagram/insights  → reach, impressions, engagement metrics
"""

import logging
from typing import Annotated, Any, Dict, List

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_active_user
from app.models.user import UserInDB
from app.services import instagram as ig

logger = logging.getLogger(__name__)
router = APIRouter()


def _http_error(exc: httpx.HTTPStatusError) -> HTTPException:
    """Convert an Instagram API HTTP error into a FastAPI 502."""
    try:
        detail = exc.response.json().get("error", {}).get("message", str(exc))
    except Exception:
        detail = str(exc)
    logger.error("Instagram API error: %s", detail)
    return HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Instagram API: {detail}")


# ── GET /instagram/profile ────────────────────────────────────────────────────

@router.get(
    "/profile",
    response_model=Dict[str, Any],
    summary="Instagram Business account profile",
)
async def get_instagram_profile(
    current_user: Annotated[UserInDB, Depends(get_active_user)],
) -> Dict[str, Any]:
    """Returns username, followers_count, media_count, bio, website."""
    try:
        return await ig.get_profile()
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except httpx.HTTPStatusError as e:
        raise _http_error(e)
    except Exception as e:
        logger.exception("Unexpected error fetching Instagram profile")
        raise HTTPException(status_code=500, detail=str(e))


# ── GET /instagram/media ──────────────────────────────────────────────────────

@router.get(
    "/media",
    response_model=List[Dict[str, Any]],
    summary="Recent Instagram posts with engagement data",
)
async def get_instagram_media(
    limit: int = Query(default=20, ge=1, le=50),
    current_user: Annotated[UserInDB, Depends(get_active_user)] = ...,
) -> List[Dict[str, Any]]:
    """Returns recent posts: caption, likes, comments, media_url, permalink."""
    try:
        return await ig.get_media(limit=limit)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except httpx.HTTPStatusError as e:
        raise _http_error(e)
    except Exception as e:
        logger.exception("Unexpected error fetching Instagram media")
        raise HTTPException(status_code=500, detail=str(e))


# ── GET /instagram/insights ───────────────────────────────────────────────────

@router.get(
    "/insights",
    response_model=Dict[str, Any],
    summary="Instagram account-level insights (reach, impressions, etc.)",
)
async def get_instagram_insights(
    period: str = Query(default="day", pattern="^(day|week|month|days_28)$"),
    current_user: Annotated[UserInDB, Depends(get_active_user)] = ...,
) -> Dict[str, Any]:
    """Returns reach, impressions, profile_views, follower_count_change."""
    try:
        return await ig.get_insights(period=period)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except httpx.HTTPStatusError as e:
        raise _http_error(e)
    except Exception as e:
        logger.exception("Unexpected error fetching Instagram insights")
        raise HTTPException(status_code=500, detail=str(e))
