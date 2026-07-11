
"""
app/routers/campaigns.py
─────────────────────────
Campaign management endpoints:
  GET  /campaigns/          — list all campaigns
  POST /campaigns/          — create a new campaign
  GET  /campaigns/{id}      — get a single campaign
  PUT  /campaigns/{id}      — update a campaign
  DELETE /campaigns/{id}    — delete a campaign
  POST /campaigns/generate  — AI campaign strategy generation
  GET  /campaigns/analytics — aggregate campaign performance
"""

import logging
from datetime import datetime, timezone
from typing import Annotated, Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.deps import get_active_user
from app.models.user import UserInDB, PyObjectId
from app.services import mock_data as md
from app.services.ibm import GraniteClient

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Models ────────────────────────────────────────────────────────────────────

class CampaignCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    objective: str = Field(..., pattern="^(brand_awareness|lead_generation|conversion|engagement|traffic)$")
    budget: float = Field(..., gt=0)
    start_date: str
    end_date: str
    platforms: List[str] = Field(..., min_length=1)
    target_audience: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=1000)


class CampaignUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=200)
    status: Optional[str] = Field(default=None, pattern="^(active|paused|completed|draft)$")
    budget: Optional[float] = Field(default=None, gt=0)
    description: Optional[str] = Field(default=None, max_length=1000)


class GenerateCampaignRequest(BaseModel):
    campaign_name: str = Field(..., min_length=1, max_length=200)
    objective: str = Field(..., min_length=1, max_length=100)
    budget: float = Field(..., gt=0)
    target_audience: str = Field(..., min_length=1, max_length=500)
    platforms: List[str] = Field(..., min_length=1)
    duration_days: int = Field(..., ge=1, le=365)
    brand_voice: Optional[str] = Field(default="professional", max_length=64)


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert ObjectId fields to strings for JSON serialisation."""
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    for key in ("user_id",):
        if key in doc and isinstance(doc[key], ObjectId):
            doc[key] = str(doc[key])
    return doc


# ── GET /campaigns/ ───────────────────────────────────────────────────────────

@router.get("/", response_model=List[Dict[str, Any]], summary="List all campaigns")
async def list_campaigns(
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
    status_filter: Optional[str] = None,
) -> List[Dict[str, Any]]:
    query: Dict[str, Any] = {"user_id": ObjectId(current_user.id)}
    if status_filter:
        query["status"] = status_filter

    cursor = database["campaigns"].find(query).sort("start_date", -1).limit(100)
    docs = await cursor.to_list(length=100)

    if not docs:
        # Seed with mock data on first access
        seeded = []
        for c in md.CAMPAIGNS:
            doc = {**c, "user_id": ObjectId(current_user.id), "created_at": datetime.now(timezone.utc)}
            result = await database["campaigns"].insert_one(doc)
            doc["id"] = str(result.inserted_id)
            seeded.append(doc)
        return [_serialize(d) for d in seeded]

    return [_serialize(d) for d in docs]


# ── POST /campaigns/ ─────────────────────────────────────────────────────────

@router.post("/", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED, summary="Create a campaign")
async def create_campaign(
    payload: CampaignCreate,
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
) -> Dict[str, Any]:
    doc: Dict[str, Any] = {
        **payload.model_dump(),
        "user_id": ObjectId(current_user.id),
        "status": "draft",
        "spent": 0,
        "metrics": {"ctr": 0, "roas": 0, "impressions": 0, "clicks": 0},
        "ai_score": 0,
        "ai_strategy": "",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await database["campaigns"].insert_one(doc)
    doc["id"] = str(result.inserted_id)
    logger.info("campaign created id=%s user=%s", doc["id"], current_user.id)
    return _serialize(doc)


# ── GET /campaigns/{id} ───────────────────────────────────────────────────────

@router.get("/{campaign_id}", response_model=Dict[str, Any], summary="Get a single campaign")
async def get_campaign(
    campaign_id: str,
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
) -> Dict[str, Any]:
    if not ObjectId.is_valid(campaign_id):
        raise HTTPException(status_code=404, detail="Campaign not found.")
    doc = await database["campaigns"].find_one(
        {"_id": ObjectId(campaign_id), "user_id": ObjectId(current_user.id)}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Campaign not found.")
    return _serialize(doc)


# ── PUT /campaigns/{id} ───────────────────────────────────────────────────────

@router.put("/{campaign_id}", response_model=Dict[str, Any], summary="Update a campaign")
async def update_campaign(
    campaign_id: str,
    payload: CampaignUpdate,
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
) -> Dict[str, Any]:
    if not ObjectId.is_valid(campaign_id):
        raise HTTPException(status_code=404, detail="Campaign not found.")
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    update["updated_at"] = datetime.now(timezone.utc)
    result = await database["campaigns"].find_one_and_update(
        {"_id": ObjectId(campaign_id), "user_id": ObjectId(current_user.id)},
        {"$set": update},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Campaign not found.")
    return _serialize(result)


# ── DELETE /campaigns/{id} ────────────────────────────────────────────────────

@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a campaign")
async def delete_campaign(
    campaign_id: str,
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
) -> None:
    if not ObjectId.is_valid(campaign_id):
        raise HTTPException(status_code=404, detail="Campaign not found.")
    result = await database["campaigns"].delete_one(
        {"_id": ObjectId(campaign_id), "user_id": ObjectId(current_user.id)}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found.")


# ── POST /campaigns/generate ──────────────────────────────────────────────────

@router.post("/generate", response_model=Dict[str, Any], summary="Generate AI campaign strategy")
async def generate_campaign(
    payload: GenerateCampaignRequest,
    current_user: Annotated[UserInDB, Depends(get_active_user)],
) -> Dict[str, Any]:
    """
    Uses IBM Granite 13B to generate a complete campaign strategy including
    phase breakdown, content pillars, KPIs, and hashtag recommendations.
    """
    logger.info("generate-campaign user=%s name=%s", current_user.id, payload.campaign_name)

    prompt = (
        f"Create a detailed social media campaign strategy for:\n"
        f"Campaign: {payload.campaign_name}\n"
        f"Objective: {payload.objective}\n"
        f"Budget: ${payload.budget:,.0f}\n"
        f"Target Audience: {payload.target_audience}\n"
        f"Platforms: {', '.join(payload.platforms)}\n"
        f"Duration: {payload.duration_days} days\n"
        f"Brand Voice: {payload.brand_voice}\n\n"
        f"Include: campaign phases, content pillars, KPIs, hashtag strategy, "
        f"posting cadence, and budget allocation."
    )
    strategy = await GraniteClient.generate(prompt=prompt, max_tokens=800)

    return {
        "campaign_name": payload.campaign_name,
        "strategy": strategy,
        "estimated_reach": int(payload.budget * 42),
        "estimated_engagement_rate": 4.8,
        "recommended_budget_split": {
            p: round(100 / len(payload.platforms), 1)
            for p in payload.platforms
        },
        "ai_score": 87,
        "powered_by": "IBM Granite 13B Instruct v2",
    }


# ── GET /campaigns/analytics ──────────────────────────────────────────────────

@router.get("/analytics/summary", response_model=Dict[str, Any], summary="Aggregate campaign performance")
async def campaign_analytics(
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
) -> Dict[str, Any]:
    cursor = database["campaigns"].find({"user_id": ObjectId(current_user.id)})
    docs = await cursor.to_list(length=200)

    if not docs:
        docs = md.CAMPAIGNS  # type: ignore[assignment]

    total_budget = sum(d.get("budget", 0) for d in docs)
    total_spent = sum(d.get("spent", 0) for d in docs)
    active = [d for d in docs if d.get("status") == "active"]
    avg_roas = (
        sum(d.get("metrics", {}).get("roas", 0) for d in active) / len(active)
        if active else 0
    )

    return {
        "total_campaigns": len(docs),
        "active_campaigns": len(active),
        "total_budget": total_budget,
        "total_spent": total_spent,
        "budget_utilisation": round(total_spent / total_budget * 100, 1) if total_budget else 0,
        "avg_roas": round(avg_roas, 2),
        "by_status": {
            status: len([d for d in docs if d.get("status") == status])
            for status in ("active", "paused", "completed", "draft")
        },
    }
