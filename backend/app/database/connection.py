import logging
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("ai_storywizard.database")

class DatabaseManager:
    """
    Singleton Manager for Motor Asynchronous MongoDB Connection.
    Maintains a shared AsyncIOMotorClient across the FastAPI application lifecycle.
    """
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
        self.is_connected: bool = False
        self.connection_error: Optional[str] = None

    async def connect(self) -> bool:
        """
        Initializes the Motor client and verifies connectivity with a ping command.
        Gracefully handles offline/unreachable states so FastAPI can start cleanly.
        """
        try:
            logger.info("Initializing AsyncIOMotorClient connection to MongoDB...")
            # Use a bounded serverSelectionTimeoutMS so offline local instances do not block startup
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=3000,
                connectTimeoutMS=3000,
            )
            self.db = self.client[settings.DATABASE_NAME]

            # Perform lightweight ping to verify connection
            await self.client.admin.command("ping")
            self.is_connected = True
            self.connection_error = None
            logger.info("Successfully connected to MongoDB database '%s'", settings.DATABASE_NAME)
            return True
        except Exception as exc:
            self.is_connected = False
            self.connection_error = str(exc)
            logger.warning(
                "MongoDB connection ping could not be completed (%s). "
                "Database initialized in standby mode.",
                exc
            )
            return False

    async def close(self) -> None:
        """Cleanly closes the Motor client session."""
        if self.client:
            logger.info("Closing MongoDB Motor client session...")
            self.client.close()
            self.client = None
            self.db = None
            self.is_connected = False
            logger.info("MongoDB connection closed cleanly.")

    def get_database(self) -> Optional[AsyncIOMotorDatabase]:
        """Returns the active MongoDB database instance."""
        return self.db

    def get_client(self) -> Optional[AsyncIOMotorClient]:
        """Returns the active AsyncIOMotorClient instance."""
        return self.client

    async def health_check(self) -> Dict[str, Any]:
        """
        Verifies database health status without exposing sensitive credentials.
        """
        if self.client is None or self.db is None:
            return {
                "status": "disconnected",
                "database": settings.DATABASE_NAME,
                "connected": False,
                "detail": "Motor client is not initialized",
            }
        try:
            # Quick 2-second ping check
            await self.client.admin.command("ping")
            return {
                "status": "connected",
                "database": settings.DATABASE_NAME,
                "connected": True,
                "detail": "MongoDB responded to ping successfully",
            }
        except Exception as exc:
            return {
                "status": "unreachable",
                "database": settings.DATABASE_NAME,
                "connected": False,
                "detail": "Database is unreachable or offline",
            }

# Singleton instance for application-wide use
db_manager = DatabaseManager()

def get_database() -> Optional[AsyncIOMotorDatabase]:
    """Dependency / Helper to retrieve the current database."""
    return db_manager.get_database()

def get_client() -> Optional[AsyncIOMotorClient]:
    """Helper to retrieve the raw Motor client."""
    return db_manager.get_client()

async def connect_to_mongodb() -> bool:
    """Helper for lifecycle startup."""
    return await db_manager.connect()

async def close_mongodb_connection() -> None:
    """Helper for lifecycle shutdown."""
    await db_manager.close()

async def check_database_health() -> Dict[str, Any]:
    """Helper for health checks."""
    return await db_manager.health_check()
