import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Search for backend/.env first, then root .env
backend_dir = Path(__file__).resolve().parent.parent.parent
env_path = backend_dir / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI StoryWizard API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Secrets & Authentication
    SECRET_KEY: str = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY", "ai-storywizard-super-secret-jwt-key-2026")
    ALGORITHM: str = os.getenv("JWT_ALGORITHM") or os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # MongoDB Configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/ai_storywizard")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ai_storywizard")

    # Groq LLM API
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    # Google Gemini API
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # CORS Allowed Origins
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]

    class Config:
        case_sensitive = True

settings = Settings()
