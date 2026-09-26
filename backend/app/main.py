from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, stories, parent
from app.database.connection import connect_to_mongodb, close_mongodb_connection, check_database_health
from app.database.collections import init_database_indexes
from app.database.seed import seed_dev_accounts

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI Application Lifespan:
    Initializes asynchronous MongoDB Motor connection on startup,
    creates essential performance indexes if reachable,
    seeds default development accounts,
    and cleanly closes connections on shutdown.
    """
    connected = await connect_to_mongodb()
    if connected:
        await init_database_indexes()
        await seed_dev_accounts()
    yield
    await close_mongodb_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Educational AI Storytelling Platform API with Strict Role Separation and Pedagogical Guardrails.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    lifespan=lifespan,
)

# Configure CORS for React Dev Servers (Port 3000 and 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(stories.router, prefix=settings.API_V1_STR)
app.include_router(parent.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint to verify backend and database availability."""
    db_health = await check_database_health()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_health,
    }

@app.get("/", tags=["System"])
async def root():
    """Root redirect / information endpoint."""
    return {
        "message": "Welcome to AI StoryWizard API",
        "docs": f"{settings.API_V1_STR}/docs",
        "endpoints": {
            "auth": f"{settings.API_V1_STR}/auth/login",
            "explore_topic": f"{settings.API_V1_STR}/stories/explore-topic",
            "child_progress": f"{settings.API_V1_STR}/parent/child-progress/{{child_id}}",
            "parent_controls": f"{settings.API_V1_STR}/parent/controls/{{child_id}}",
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
