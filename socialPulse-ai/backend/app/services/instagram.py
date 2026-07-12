"""
app/services/instagram.py
──────────────────────────
Instagram Graph API client.
Access token is read from environment — never exposed to the frontend.

Endpoints used:
  GET /{ig_user_id}                    → profile
  GET /{ig_user_id}/media              → media list
  GET /{media_id}/insights             → per-post insights
  GET /{ig_user_id}/insights           → account-level insights
"""

import logging
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

_BASE = "https://graph.facebook.com/v19.0"
_TIMEOUT = 15.0


def _configured() -> bool:
    """Return True only if all required Instagram env vars are set."""
    return bool(
        settings.INSTAGRAM_ACCESS_TOKEN
        and settings.INSTAGRAM_BUSINESS_ACCOUNT_ID
        and settings.META_APP_ID
        and settings.META_APP_SECRET
    )


async def get_profile() -> Dict[str, Any]:
    """
    GET /{ig_user_id}?fields=username,followers_count,media_count,profile_picture_url,biography,website
    Returns profile dict or raises RuntimeError with a clear message.
    """
    if not _configured():
        raise RuntimeError(
            "Instagram not configured. Set META_APP_ID, META_APP_SECRET, "
            "INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID in backend/.env"
        )

    url = f"{_BASE}/{settings.INSTAGRAM_BUSINESS_ACCOUNT_ID}"
    params = {
        "fields": "username,followers_count,media_count,profile_picture_url,biography,website",
        "access_token": settings.INSTAGRAM_ACCESS_TOKEN,
    }
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        data = r.json()

    logger.info("Instagram profile fetched: @%s", data.get("username"))
    return {
        "username": data.get("username", ""),
        "followers_count": data.get("followers_count", 0),
        "media_count": data.get("media_count", 0),
        "profile_picture_url": data.get("profile_picture_url"),
        "biography": data.get("biography", ""),
        "website": data.get("website", ""),
    }


async def get_media(limit: int = 20) -> List[Dict[str, Any]]:
    """
    GET /{ig_user_id}/media?fields=id,caption,media_type,timestamp,like_count,comments_count,media_url,permalink
    Returns list of recent posts.
    """
    if not _configured():
        raise RuntimeError("Instagram not configured — see backend/.env")

    url = f"{_BASE}/{settings.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media"
    params = {
        "fields": "id,caption,media_type,timestamp,like_count,comments_count,media_url,permalink,thumbnail_url",
        "limit": limit,
        "access_token": settings.INSTAGRAM_ACCESS_TOKEN,
    }
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        raw = r.json().get("data", [])

    posts = []
    for p in raw:
        posts.append({
            "id": p.get("id"),
            "caption": (p.get("caption") or "")[:300],
            "media_type": p.get("media_type", "IMAGE"),
            "timestamp": p.get("timestamp"),
            "like_count": p.get("like_count", 0),
            "comments_count": p.get("comments_count", 0),
            "media_url": p.get("media_url") or p.get("thumbnail_url"),
            "permalink": p.get("permalink"),
        })

    logger.info("Instagram media fetched: %d posts", len(posts))
    return posts


async def get_insights(period: str = "day", since: Optional[int] = None, until: Optional[int] = None) -> Dict[str, Any]:
    """
    GET /{ig_user_id}/insights?metric=reach,impressions,profile_views,follower_count&period=day
    Returns account-level insights for the requested period.
    """
    if not _configured():
        raise RuntimeError("Instagram not configured — see backend/.env")

    url = f"{_BASE}/{settings.INSTAGRAM_BUSINESS_ACCOUNT_ID}/insights"
    params: Dict[str, Any] = {
        "metric": "reach,impressions,profile_views,follower_count",
        "period": period,
        "access_token": settings.INSTAGRAM_ACCESS_TOKEN,
    }
    if since:
        params["since"] = since
    if until:
        params["until"] = until

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        raw = r.json().get("data", [])

    # Flatten into a simple dict keyed by metric name
    result: Dict[str, Any] = {}
    for metric in raw:
        name = metric.get("name")
        values = metric.get("values", [])
        result[name] = values  # list of {value, end_time}

    # Summary totals
    def _total(key: str) -> int:
        return sum(v.get("value", 0) for v in result.get(key, []))

    logger.info("Instagram insights fetched, metrics=%s", list(result.keys()))
    return {
        "reach": _total("reach"),
        "impressions": _total("impressions"),
        "profile_views": _total("profile_views"),
        "follower_count_change": _total("follower_count"),
        "period": period,
        "raw": result,
    }
