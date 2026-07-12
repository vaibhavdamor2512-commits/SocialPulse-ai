"""
reset_demo_user.py
──────────────────
Run once to fix the demo user's password hash in MongoDB.

    cd socialPulse-ai/backend
    python reset_demo_user.py

Works whether the user exists (updates hash) or not (creates it).
"""
import asyncio
from datetime import datetime, timezone

import bcrypt
import motor.motor_asyncio

MONGODB_URL  = "mongodb://localhost:27017"
DB_NAME      = "socialpulse"
DEMO_EMAIL   = "demo@socialpulse.ai"
DEMO_PASSWORD = "Demo1234!"
DEMO_NAME    = "Demo User"


def hash_pw(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


async def main() -> None:
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]

    fresh_hash = hash_pw(DEMO_PASSWORD)
    now = datetime.now(timezone.utc)

    existing = await db["users"].find_one({"email": DEMO_EMAIL})

    if existing:
        await db["users"].update_one(
            {"email": DEMO_EMAIL},
            {"$set": {
                "password_hash": fresh_hash,
                "is_active": True,
                "is_verified": True,
                "updated_at": now,
            }},
        )
        print(f"✅  Updated password hash for {DEMO_EMAIL}")
    else:
        await db["users"].insert_one({
            "name": DEMO_NAME,
            "email": DEMO_EMAIL,
            "password_hash": fresh_hash,
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
            "created_at": now,
            "updated_at": now,
        })
        print(f"✅  Created demo user {DEMO_EMAIL}")

    # Verify it works
    doc = await db["users"].find_one({"email": DEMO_EMAIL})
    ok = bcrypt.checkpw(DEMO_PASSWORD.encode("utf-8"), doc["password_hash"].encode("utf-8"))
    print(f"🔑  Password verification test: {'PASS ✅' if ok else 'FAIL ❌'}")
    print(f"\nLogin with:\n  email:    {DEMO_EMAIL}\n  password: {DEMO_PASSWORD}")

    client.close()


asyncio.run(main())
