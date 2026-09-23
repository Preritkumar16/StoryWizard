import logging
from typing import Optional, List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase
from app.database.connection import get_database

logger = logging.getLogger("ai_storywizard.database.collections")

# Logical Collection Names
COLLECTION_USERS = "users"
COLLECTION_CHILD_PROFILES = "child_profiles"
COLLECTION_STORIES = "stories"
COLLECTION_QUIZZES = "quizzes"
COLLECTION_PROGRESS = "progress"
COLLECTION_PARENTAL_CONTROLS = "parental_controls"

class DatabaseCollections:
    """
    Centralized, typed access to all logical MongoDB collections.
    Prevents repetitive scattering of raw client["database"]["collection"] calls.
    """
    @property
    def db(self) -> Optional[AsyncIOMotorDatabase]:
        return get_database()

    @property
    def users(self) -> Optional[AsyncIOMotorCollection]:
        db = self.db
        return db[COLLECTION_USERS] if db is not None else None

    @property
    def child_profiles(self) -> Optional[AsyncIOMotorCollection]:
        db = self.db
        return db[COLLECTION_CHILD_PROFILES] if db is not None else None

    @property
    def stories(self) -> Optional[AsyncIOMotorCollection]:
        db = self.db
        return db[COLLECTION_STORIES] if db is not None else None

    @property
    def quizzes(self) -> Optional[AsyncIOMotorCollection]:
        db = self.db
        return db[COLLECTION_QUIZZES] if db is not None else None

    @property
    def progress(self) -> Optional[AsyncIOMotorCollection]:
        db = self.db
        return db[COLLECTION_PROGRESS] if db is not None else None

    @property
    def parental_controls(self) -> Optional[AsyncIOMotorCollection]:
        db = self.db
        return db[COLLECTION_PARENTAL_CONTROLS] if db is not None else None

# Shared singleton collections accessor
collections = DatabaseCollections()

def get_collections() -> DatabaseCollections:
    """Dependency / Helper to access collections."""
    return collections

async def init_database_indexes() -> Dict[str, Any]:
    """
    Ensures safe, clearly justified indexes exist for performance and uniqueness.
    - users: unique email / username index for rapid authentication lookup
    - child_profiles: index on parent_id for family grouping
    - stories: compound index on (child_id, created_at) for story history queries
    - progress: compound index on (child_id, created_at) for Lexile/telemetry queries
    - parental_controls: unique index on child_id
    """
    db = get_database()
    if db is None:
        logger.info("Database not connected; skipping index creation.")
        return {"status": "skipped", "reason": "Database not connected"}

    results = {}
    try:
        # 1. Users collection indexes
        users_col = db[COLLECTION_USERS]
        await users_col.create_index("email", unique=True, sparse=True)
        await users_col.create_index("username", unique=True, sparse=True)
        results["users"] = "Indexed: email (unique), username (unique)"

        # 2. Child Profiles collection indexes
        profiles_col = db[COLLECTION_CHILD_PROFILES]
        await profiles_col.create_index("parent_id")
        results["child_profiles"] = "Indexed: parent_id"

        # 3. Stories collection indexes
        stories_col = db[COLLECTION_STORIES]
        await stories_col.create_index([("child_id", 1), ("created_at", -1)])
        results["stories"] = "Indexed: (child_id, created_at)"

        # 4. Progress / Telemetry collection indexes
        progress_col = db[COLLECTION_PROGRESS]
        await progress_col.create_index([("child_id", 1), ("created_at", -1)])
        results["progress"] = "Indexed: (child_id, created_at)"

        # 5. Parental Controls collection indexes
        controls_col = db[COLLECTION_PARENTAL_CONTROLS]
        await controls_col.create_index("child_id", unique=True)
        results["parental_controls"] = "Indexed: child_id (unique)"

        logger.info("Database indexes initialized successfully: %s", results)
        return {"status": "success", "indexes": results}
    except Exception as exc:
        logger.warning("Index initialization encountered warning: %s", exc)
        return {"status": "warning", "detail": str(exc)}
