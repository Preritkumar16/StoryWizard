import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.core.security import hash_password, hash_pin
from app.database.collections import COLLECTION_USERS, COLLECTION_CHILD_PROFILES
from app.database.connection import db_manager, get_database

logger = logging.getLogger("ai_storywizard.database.seed")

# Default seed data definitions (passwords/pins hashed before storage)
SEED_PARENT = {
    "_id": "parent-sarah",
    "email": "sarah.chen@example.com",
    "name": "Sarah Chen",
    "role": "parent",
    "raw_password": "password123",
}

SEED_CHILD = {
    "_id": "student-alex",
    "parent_id": "parent-sarah",
    "username": "alex.chen",
    "child_code": "student-alex",
    "name": "Alex Chen",
    "role": "student",
    "grade_band": "Grade 3-4",
    "raw_pin": "1234",
}

async def seed_dev_accounts(db=None) -> Dict[str, Any]:
    """
    Populates standard seed test accounts in MongoDB if not already present.
    Ensures passwords and PINs are securely hashed with bcrypt prior to insertion.
    """
    if db is None:
        db = get_database()
    
    if db is None:
        logger.warning("MongoDB is offline or not connected; skipping account seeding.")
        return {
            "status": "skipped",
            "message": "MongoDB database is currently offline or unreachable"
        }

    now = datetime.now(timezone.utc)
    seeded_records = []

    try:
        users_col = db[COLLECTION_USERS]
        child_col = db[COLLECTION_CHILD_PROFILES]

        # 1. Seed Parent Account
        existing_parent = await users_col.find_one({"email": SEED_PARENT["email"]})
        if not existing_parent:
            parent_doc = {
                "_id": SEED_PARENT["_id"],
                "email": SEED_PARENT["email"],
                "name": SEED_PARENT["name"],
                "role": SEED_PARENT["role"],
                "password_hash": hash_password(SEED_PARENT["raw_password"]),
                "created_at": now,
                "updated_at": now
            }
            await users_col.insert_one(parent_doc)
            seeded_records.append(f"Parent user '{SEED_PARENT['email']}'")
            logger.info("Seeded parent account: %s", SEED_PARENT["email"])
        else:
            logger.info("Parent account '%s' already exists.", SEED_PARENT["email"])

        # 2. Seed Student Child Account
        existing_child = await child_col.find_one({
            "$or": [
                {"username": SEED_CHILD["username"]},
                {"_id": SEED_CHILD["_id"]}
            ]
        })
        if not existing_child:
            child_doc = {
                "_id": SEED_CHILD["_id"],
                "parent_id": SEED_CHILD["parent_id"],
                "username": SEED_CHILD["username"],
                "child_code": SEED_CHILD["child_code"],
                "name": SEED_CHILD["name"],
                "role": SEED_CHILD["role"],
                "grade_band": SEED_CHILD["grade_band"],
                "pin_hash": hash_pin(SEED_CHILD["raw_pin"]),
                "created_at": now,
                "updated_at": now
            }
            await child_col.insert_one(child_doc)
            seeded_records.append(f"Student profile '{SEED_CHILD['username']}'")
            logger.info("Seeded child profile: %s", SEED_CHILD["username"])
        else:
            logger.info("Student profile '%s' already exists.", SEED_CHILD["username"])

        return {
            "status": "success",
            "seeded": seeded_records,
            "count": len(seeded_records)
        }
    except Exception as exc:
        logger.error("Error occurred while seeding database: %s", exc)
        return {
            "status": "error",
            "detail": str(exc)
        }

async def main():
    logging.basicConfig(level=logging.INFO)
    logger.info("Connecting to MongoDB for manual seeding...")
    connected = await db_manager.connect()
    if connected:
        res = await seed_dev_accounts(db_manager.get_database())
        logger.info("Seeding result: %s", res)
        await db_manager.close()
    else:
        logger.error("Unable to connect to MongoDB.")

if __name__ == "__main__":
    asyncio.run(main())
