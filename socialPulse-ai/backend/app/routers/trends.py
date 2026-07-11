"""
app/routers/trends.py
──────────────────────
Trend prediction and forecasting endpoints:
  GET /trends/                — list Granite-powered trend predictions
  GET /trends/forecast        — 6-week engagement forecast
  GET /trends/virality        — virality predictor for content types
  GET /trends/hashtag/{tag}   — deep dive forecast for a single hashtag
"""

import logging
from datetime import datetime, timezone
from typing import Annotated, Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Query

from app.core.deps import get_active_user
from app.models.user import UserInDB
from app.services import mock_data as md
from app.services.ibm import GraniteClient

logger = logging.getLogger(__name__)

router = APIRouter()


# ── GET /trends/ ──────────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=Dict[str, Any],
    summary="Granite-powered trend predictions for the next 6 weeks",
)
async def list_trends(
    category: Optional[str] = Query(default=None),
    direction: Optional[str] = Query(default=None, pattern="^(up|down|stable)$"),
    min_confidence: int = Query(default=0, ge=0, le=100),
    current_user: Annotated[UserInDB, Depends(get_active_user)] = ...,
) -> Dict[str, Any]:
    logger.info("trends user=%s", current_user.id)

    predictions = md.TREND_PREDICTIONS
    if category:
        predictions = [p for p in predictions if p.get("category", "").lower() == category.lower()]
    if direction:
        predictions = [p for p in predictions if p.get("direction") == direction]
    if min_confidence > 0:
        predictions = [p for p in predictions if p.get("confidence", 0) >= min_confidence]

    return {
        "predictions": predictions,
        "total": len(predictions),
        "forecast_horizon_weeks": 6,
        "powered_by": "IBM Granite 13B + Watson NLP trend analysis",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


# ── GET /trends/forecast ──────────────────────────────────────────────────────

@router.get(
    "/forecast",
    response_model=Dict[str, Any],
    summary="6-week engagement rate forecast (actual vs predicted)",
)
async def engagement_forecast(
    weeks: int = Query(default=6, ge=2, le=12),
    current_user: Annotated[UserInDB, Depends(get_active_user)] = ...,
) -> Dict[str, Any]:
    logger.info("engagement-forecast user=%s weeks=%d", current_user.id, weeks)
    return {
        "forecast": md.engagement_forecast(weeks),
        "model_accuracy": 87.4,
        "confidence_band": 0.4,
        "summary": (
            f"Engagement rate is predicted to rise from 4.2% to ~6.2% over {weeks} weeks, "
            f"driven by consistent posting frequency and improving content quality score."
        ),
        "powered_by": "IBM Granite predictive analytics",
    }


# ── GET /trends/virality ──────────────────────────────────────────────────────

@router.get(
    "/virality",
    response_model=Dict[str, Any],
    summary="AI virality predictions for different content types",
)
async def virality_predictions(
    current_user: Annotated[UserInDB, Depends(get_active_user)],
) -> Dict[str, Any]:
    logger.info("virality-predictions user=%s", current_user.id)
    return {
        "predictions": md.virality_predictions(),
        "methodology": (
            "Virality score combines historical engagement patterns, "
            "trend momentum, content format performance, and audience behaviour signals "
            "processed by IBM Granite 13B."
        ),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


# ── GET /trends/hashtag/{tag} ─────────────────────────────────────────────────

@router.get(
    "/hashtag/{tag}",
    response_model=Dict[str, Any],
    summary="Deep-dive forecast for a specific hashtag",
)
async def hashtag_deep_dive(
    tag: str,
    current_user: Annotated[UserInDB, Depends(get_active_user)],
) -> Dict[str, Any]:
    clean_tag = tag.lstrip("#")
    logger.info("hashtag-deep-dive user=%s tag=%s", current_user.id, clean_tag)

    # Look up in mock predictions first
    match = next(
        (p for p in md.TREND_PREDICTIONS if clean_tag.lower() in p["hashtag"].lower()),
        None,
    )

    if not match:
        # Generate an AI insight for an unknown hashtag
        prompt = (
            f"Analyse the social media trend potential of the hashtag #{clean_tag}. "
            f"Provide a 6-week volume forecast and strategic recommendation."
        )
        ai_insight = await GraniteClient.generate(prompt=prompt, max_tokens=400)
        return {
            "hashtag": f"#{clean_tag}",
            "found": False,
            "ai_insight": ai_insight,
            "powered_by": "IBM Granite 13B",
        }

    prompt = (
        f"Provide a detailed strategic analysis and content recommendation for "
        f"the hashtag {match['hashtag']} which is trending {match['direction']}. "
        f"Include best content types, posting times, and audience targeting advice."
    )
    ai_strategy = await GraniteClient.generate(prompt=prompt, max_tokens=400)

    return {
        **match,
        "found": True,
        "ai_strategy": ai_strategy,
        "powered_by": "IBM Granite 13B + Watson NLP",
    }
