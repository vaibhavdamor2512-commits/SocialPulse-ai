"""
app/routers/notifications.py
─────────────────────────────
Notification management endpoints:
  GET   /notifications/         — list notifications (unread first)
  PUT   /notifications/{id}/read — mark a single notification as read
  PUT   /notifications/read-all  — mark all notifications as read
  DELETE /notifications/{id}    — dismiss a notification
  POST  /notifications/alert    — internal: create a system alert
"""

import logging
from datetime import datetime, timezone
from typing import Annotated, Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.deps import get_active_user
from app.models.user import UserInDB
from app.services import mock_data as md

logger = logging.getLogger(__name__)

router = APIRouter()


class AlertCreate(BaseModel):
    type: str = Field(..., min_length=1, max_length=64)
    title: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1, max_length=1000)
    severity: str = Field(default="info", pattern="^(info|warning|success|error)$")
    action_url: Optional[str] = Field(default=None, max_length=512)


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    if "user_id" in doc and isinstance(doc["user_id"], ObjectId):
        doc["user_id"] = str(doc["user_id"])
    return doc


# ── GET /notifications/ ───────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=Dict[str, Any],
    summary="List notifications for the current user",
)
async def list_notifications(
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
    unread_only: bool = Query(default=False),
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
) -> Dict[str, Any]:
    query: Dict[str, Any] = {"user_id": ObjectId(current_user.id)}
    if unread_only:
        query["read"] = False

    total = await database["notifications"].count_documents(query)
    docs = (
        await database["notifications"]
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )

    if not docs and not unread_only:
        # Seed with default notifications
        seeded = []
        for n in md.default_notifications():
            doc = {**n, "user_id": ObjectId(current_user.id)}
            result = await database["notifications"].insert_one(doc)
            doc["id"] = str(result.inserted_id)
            seeded.append(doc)
        return {
            "notifications": [_serialize(d) for d in seeded],
            "total": len(seeded),
            "unread_count": sum(1 for d in seeded if not d.get("read")),
            "page": {"skip": skip, "limit": limit},
        }

    unread_count = await database["notifications"].count_documents(
        {"user_id": ObjectId(current_user.id), "read": False}
    )
    return {
        "notifications": [_serialize(d) for d in docs],
        "total": total,
        "unread_count": unread_count,
        "page": {"skip": skip, "limit": limit},
    }


# ── PUT /notifications/{id}/read ──────────────────────────────────────────────

@router.put(
    "/{notification_id}/read",
    response_model=Dict[str, Any],
    summary="Mark a single notification as read",
)
async def mark_read(
    notification_id: str,
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
) -> Dict[str, Any]:
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=404, detail="Notification not found.")
    doc = await database["notifications"].find_one_and_update(
        {"_id": ObjectId(notification_id), "user_id": ObjectId(current_user.id)},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc)}},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return _serialize(doc)


# ── PUT /notifications/read-all ───────────────────────────────────────────────

@router.put(
    "/read-all",
    response_model=Dict[str, Any],
    summary="Mark all unread notifications as read",
)
async def mark_all_read(
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
) -> Dict[str, Any]:
    result = await database["notifications"].update_many(
        {"user_id": ObjectId(current_user.id), "read": False},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc)}},
    )
    return {
        "marked_read": result.modified_count,
        "message": f"{result.modified_count} notification(s) marked as read.",
    }


# ── DELETE /notifications/{id} ────────────────────────────────────────────────

@router.delete(
    "/{notification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Dismiss / delete a notification",
)
async def delete_notification(
    notification_id: str,
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
) -> None:
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=404, detail="Notification not found.")
    result = await database["notifications"].delete_one(
        {"_id": ObjectId(notification_id), "user_id": ObjectId(current_user.id)}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found.")


# ── POST /notifications/alert (internal) ─────────────────────────────────────

@router.post(
    "/alert",
    response_model=Dict[str, Any],
    status_code=status.HTTP_201_CREATED,
    summary="Create a system alert notification",
)
async def create_alert(
    payload: AlertCreate,
    current_user: Annotated[UserInDB, Depends(get_active_user)],
    database=Depends(get_db),
) -> Dict[str, Any]:
    doc: Dict[str, Any] = {
        **payload.model_dump(),
        "user_id": ObjectId(current_user.id),
        "read": False,
        "created_at": datetime.now(timezone.utc),
    }
    result = await database["notifications"].insert_one(doc)
    doc["id"] = str(result.inserted_id)
    logger.info("alert created id=%s user=%s type=%s", doc["id"], current_user.id, payload.type)
    return _serialize(doc)
