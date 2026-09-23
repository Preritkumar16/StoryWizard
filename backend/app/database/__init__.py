"""Database package for AI StoryWizard."""
from app.database.connection import (
    db_manager,
    get_database,
    get_client,
    connect_to_mongodb,
    close_mongodb_connection,
    check_database_health,
)
from app.database.collections import (
    DatabaseCollections,
    get_collections,
    init_database_indexes,
    COLLECTION_USERS,
    COLLECTION_CHILD_PROFILES,
    COLLECTION_STORIES,
    COLLECTION_QUIZZES,
    COLLECTION_PROGRESS,
    COLLECTION_PARENTAL_CONTROLS,
)

__all__ = [
    "db_manager",
    "get_database",
    "get_client",
    "connect_to_mongodb",
    "close_mongodb_connection",
    "check_database_health",
    "DatabaseCollections",
    "get_collections",
    "init_database_indexes",
    "COLLECTION_USERS",
    "COLLECTION_CHILD_PROFILES",
    "COLLECTION_STORIES",
    "COLLECTION_QUIZZES",
    "COLLECTION_PROGRESS",
    "COLLECTION_PARENTAL_CONTROLS",
]
