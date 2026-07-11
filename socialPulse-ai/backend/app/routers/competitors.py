"""
app/routers/competitors.py
───────────────────────────
Competitor intelligence endpoints:
  GET  /competitors/              — list tracked competitors
  POST /competitors/              — add a competitor
  DELETE /competitors/{id}        — remove a competitor
  GET  /competitors/swot          — IBM Granite SWOT analysis
  GET  /competitors/recommendations — AI strategic recommendations
"""

import logging
from datetime import datetime, timezone
from typing import Annotated, Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.deps import get_active_user
from app.models.user import UserInDB
from app.services import mock_data as md
from app.services.ibm import GraniteClient

logger = logging.getLogger(__name__)

router = APIRouter()


class CompetitorAdd(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    handle: str = Field(..., min_length=1, max_length=64)
    platform: str = Field(..., pattern="^(instagram|twitter|linkedin|facebook)$")


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    if "user_id" in doc and isinstance(doc["user_id"], ObjectId):
        doc["user_id"] = str(doc["user_id"])
    return doc


# ── GET /competitors/ ─────────────────────────────────────────────────────────

@router.get("/", response_model=List[Dict[str, Any]], summary="List tracked competitors")
async def list_competitors(
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
) -> List[Dict[str, Any]]:
    docs = await database["competitors"].find(
        {"user_id": ObjectId(current_user.id)}
    ).to_list(length=20)

    if not docs:
        seeded = []
        for c in md.COMPETITORS:
            doc = {**c, "user_id": ObjectId(current_user.id), "created_at": datetime.now(timezone.utc)}
            result = await database["competitors"].insert_one(doc)
            doc["id"] = str(result.inserted_id)
            seeded.append(doc)
        return [_serialize(d) for d in seeded]

    return [_serialize(d) for d in docs]


# ── POST /competitors/ ────────────────────────────────────────────────────────

@router.post("/", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED, summary="Add a competitor")
async def add_competitor(
    payload: CompetitorAdd,
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
) -> Dict[str, Any]:
    doc: Dict[str, Any] = {
        **payload.model_dump(),
        "user_id": ObjectId(current_user.id),
        "followers": 0,
        "growth_rate": 0.0,
        "engagement": 0.0,
        "sentiment": 50,
        "posts_per_week": 0,
        "top_hashtags": [],
        "created_at": datetime.now(timezone.utc),
    }
    result = await database["competitors"].insert_one(doc)
    doc["id"] = str(result.inserted_id)
    logger.info("competitor added id=%s user=%s", doc["id"], current_user.id)
    return _serialize(doc)


# ── DELETE /competitors/{id} ──────────────────────────────────────────────────

@router.delete("/{competitor_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove a competitor")
async def remove_competitor(
    competitor_id: str,
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
) -> None:
    if not ObjectId.is_valid(competitor_id):
        raise HTTPException(status_code=404, detail="Competitor not found.")
    result = await database["competitors"].delete_one(
        {"_id": ObjectId(competitor_id), "user_id": ObjectId(current_user.id)}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Competitor not found.")


# ── GET /competitors/swot ─────────────────────────────────────────────────────

@router.get("/swot", response_model=Dict[str, Any], summary="IBM Granite SWOT analysis")
async def get_swot(
    competitor: Optional[str] = None,
    current_user: Annotated[UserInDB, Depends(get_active_user)] = ...,
    database=Depends(get_db),
) -> Dict[str, Any]:
    """
    Generates a SWOT analysis using IBM Granite 13B comparing your brand
    against tracked competitors.
    """
    logger.info("swot user=%s competitor=%s", current_user.id, competitor)

    comp_name = competitor or "your top competitor"
    prompt = (
        f"Perform a detailed SWOT analysis comparing our brand against {comp_name} "
        f"in the social media marketing space. Include specific, actionable insights "
        f"for Strengths, Weaknesses, Opportunities, and Threats."
    )
    analysis_text = await GraniteClient.generate(prompt=prompt, max_tokens=600)

    return {
        "competitor": comp_name,
        "analysis": analysis_text,
        "structured": {
            "strengths": [
                "Strong brand identity and consistent visual language",
                "Higher engagement rate (4.2%) vs industry average (3.1%)",
                "Loyal, highly active community",
                "AI-powered content strategy with IBM Granite",
            ],
            "weaknesses": [
                "Smaller follower base on Facebook vs competitors",
                "Lower posting frequency on X/Twitter",
                "Limited short-form video content",
            ],
            "opportunities": [
                "LinkedIn B2B content gap — competitors underperforming here",
                "AI-generated personalised content at scale",
                "Cross-platform campaign synergies not fully exploited",
                "Rising demand for authentic, behind-the-scenes content",
            ],
            "threats": [
                "Competitors increasing ad spend aggressively (TechVision Co +34%)",
                "Algorithm changes reducing organic reach",
                "Rising content production costs",
                "Audience attention fragmentation across new platforms",
            ],
        },
        "powered_by": "IBM Granite 13B Instruct v2",
    }


# ── GET /competitors/recommendations ─────────────────────────────────────────

@router.get(
    "/recommendations",
    response_model=List[Dict[str, Any]],
    summary="AI strategic recommendations based on competitive landscape",
)
async def get_recommendations(
    current_user: Annotated[UserInDB, Depends(get_active_user)],
) -> List[Dict[str, Any]]:
    logger.info("recommendations user=%s", current_user.id)
    return md.AI_RECOMMENDATIONS
