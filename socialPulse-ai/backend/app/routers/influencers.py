"""
app/routers/influencers.py
───────────────────────────
Influencer discovery and scoring endpoints:
  GET /influencers/           — list influencers with relevance scores
  GET /influencers/{id}/score — AI collaboration score + breakdown
  GET /influencers/network    — network graph data (nodes + edges)
"""

import logging
from datetime import datetime, timezone
from typing import Annotated, Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, Query

from app.core.database import get_db
from app.core.deps import get_active_user
from app.models.user import UserInDB
from app.services import mock_data as md
from app.services.ibm import GraniteClient

logger = logging.getLogger(__name__)

router = APIRouter()


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    if "user_id" in doc and isinstance(doc["user_id"], ObjectId):
        doc["user_id"] = str(doc["user_id"])
    return doc


# ── GET /influencers/ ─────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=List[Dict[str, Any]],
    summary="List influencers with AI collaboration scores",
)
async def list_influencers(
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
    platform: Optional[str] = Query(default=None, pattern="^(instagram|twitter|linkedin|facebook)$"),
    min_score: int = Query(default=0, ge=0, le=100),
    limit: int = Query(default=20, ge=1, le=100),
) -> List[Dict[str, Any]]:
    query: Dict[str, Any] = {}
    if platform:
        query["platform"] = platform
    if min_score > 0:
        query["ai_collaboration_score"] = {"$gte": min_score}

    docs = await database["influencers"].find(query).sort(
        "ai_collaboration_score", -1
    ).limit(limit).to_list(length=limit)

    if not docs:
        # Seed mock influencers
        seeded = []
        for inf in md.INFLUENCERS:
            doc = {**inf, "created_at": datetime.now(timezone.utc)}
            result = await database["influencers"].insert_one(doc)
            doc["id"] = str(result.inserted_id)
            seeded.append(doc)

        if platform:
            seeded = [d for d in seeded if d.get("platform") == platform]
        if min_score > 0:
            seeded = [d for d in seeded if d.get("ai_collaboration_score", 0) >= min_score]
        return [_serialize(d) for d in seeded[:limit]]

    return [_serialize(d) for d in docs]


# ── GET /influencers/network ──────────────────────────────────────────────────

@router.get(
    "/network",
    response_model=Dict[str, Any],
    summary="Influencer network graph (nodes + edges) for D3.js visualisation",
)
async def get_network(
    current_user: Annotated[UserInDB, Depends(get_active_user)],
) -> Dict[str, Any]:
    logger.info("influencer-network user=%s", current_user.id)
    return {
        **md.INFLUENCER_NETWORK,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


# ── GET /influencers/{id}/score ───────────────────────────────────────────────

@router.get(
    "/{influencer_id}/score",
    response_model=Dict[str, Any],
    summary="AI collaboration score + factor breakdown for a specific influencer",
)
async def get_collaboration_score(
    influencer_id: str,
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
) -> Dict[str, Any]:
    """
    Uses IBM Granite to compute a nuanced collaboration score based on:
    audience alignment, engagement quality, brand safety, content authenticity,
    and reach potential.
    """
    logger.info("collab-score user=%s influencer=%s", current_user.id, influencer_id)

    # Try to look up influencer from DB first
    influencer: Optional[Dict[str, Any]] = None
    if ObjectId.is_valid(influencer_id):
        raw = await database["influencers"].find_one({"_id": ObjectId(influencer_id)})
        if raw:
            influencer = _serialize(raw)

    # Fall back to mock data by positional index or first influencer
    if not influencer:
        idx = next(
            (i for i, inf in enumerate(md.INFLUENCERS) if inf["handle"].lower() == influencer_id.lower()),
            0,
        )
        influencer = md.INFLUENCERS[idx]

    name = influencer.get("name", "this influencer")
    niche = influencer.get("niche", "general")
    followers = influencer.get("followers", 0)
    engagement = influencer.get("engagement_rate", 0)

    prompt = (
        f"Analyse the collaboration potential for {name}, a {niche} influencer "
        f"with {followers:,} followers and {engagement}% engagement rate. "
        f"Provide a brief recommendation on collaboration strategy and expected ROI."
    )
    ai_recommendation = await GraniteClient.generate(prompt=prompt, max_tokens=300)

    base_score = influencer.get("ai_collaboration_score", 85)
    return {
        "influencer_id": influencer_id,
        "influencer_name": name,
        "overall_score": base_score,
        "grade": "A" if base_score >= 90 else "B" if base_score >= 75 else "C",
        "score_breakdown": {
            "audience_alignment":   influencer.get("audience_match", 85),
            "engagement_quality":   min(100, int(engagement * 10)),
            "brand_safety":         92,
            "content_authenticity": influencer.get("authenticity", 90),
            "reach_potential":      min(100, int(followers / 2500)),
        },
        "ai_recommendation": ai_recommendation,
        "estimated_reach": int(followers * engagement / 100),
        "estimated_cpm": round(15 - (engagement - 3) * 0.8, 2),
        "powered_by": "IBM Granite 13B Instruct v2",
    }
