"""Delete all non-demo users so people can register fresh."""
import os
from dotenv import load_dotenv
import pymongo

load_dotenv(".env")
client = pymongo.MongoClient(os.environ["MONGODB_URL"], serverSelectionTimeoutMS=10000)
db = client["socialpulse"]

result = db["users"].delete_many({"email": {"$ne": "demo@socialpulse.ai"}})
print(f"Deleted {result.deleted_count} old user(s). Only demo account remains.")
remaining = [u["email"] for u in db["users"].find({}, {"email": 1, "_id": 0})]
print("Remaining:", remaining)
client.close()
