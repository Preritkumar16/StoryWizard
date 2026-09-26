import os
import logging
from pathlib import Path
from typing import Optional, Any

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(dotenv_path=None):
        if dotenv_path and Path(dotenv_path).exists():
            try:
                with open(dotenv_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            key, val = line.split("=", 1)
                            key = key.strip()
                            val = val.strip().strip('"').strip("'")
                            if key not in os.environ:
                                os.environ[key] = val
            except Exception:
                pass


logger = logging.getLogger("ai_storywizard.ai.config")

# Resolve root and backend directory to search for environment files
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent.parent
backend_env = project_root / "backend" / ".env"
root_env = project_root / ".env"

if backend_env.exists():
    load_dotenv(dotenv_path=backend_env)
elif root_env.exists():
    load_dotenv(dotenv_path=root_env)
else:
    load_dotenv()

class AISettings:
    """Centralized AI configuration for Groq and LangGraph multi-agent orchestration."""
    def __init__(self):
        self.GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
        self.GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.DEFAULT_TEMPERATURE: float = float(os.getenv("GROQ_TEMPERATURE", "0.7"))
        self.MAX_RETRIES: int = int(os.getenv("GROQ_MAX_RETRIES", "2"))
        self.REQUEST_TIMEOUT_SECONDS: int = int(os.getenv("GROQ_TIMEOUT_SECONDS", "30"))

    @property
    def has_groq_key(self) -> bool:
        return bool(self.GROQ_API_KEY and len(self.GROQ_API_KEY.strip()) > 5 and not self.GROQ_API_KEY.startswith("your_"))

ai_settings = AISettings()

class BaseLLMClient:
    """Base interface for AI LLM Invocation in the Multi-Agent system."""
    async def ainvoke(self, messages: Any) -> Any:
        raise NotImplementedError

    def invoke(self, messages: Any) -> Any:
        raise NotImplementedError

class MockGroqLLM(BaseLLMClient):
    """
    Mock LLM Provider for local verification, automated tests, and offline execution
    when GROQ_API_KEY is not configured in the environment.
    """
    def __init__(self, model: str = "mock-groq-llama-3.3"):
        self.model = model

    def invoke(self, messages: Any) -> Any:
        class MockResponse:
            def __init__(self, content: str):
                self.content = content
        return MockResponse(content="{}")

    async def ainvoke(self, messages: Any) -> Any:
        return self.invoke(messages)

def get_groq_llm(
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    force_mock: bool = False
) -> Any:
    """
    Centralized LLM Factory / Provider.
    Returns a configured LangChain ChatGroq instance if available and configured,
    or raises a structured exception / returns mock for offline execution.
    """
    selected_model = model or ai_settings.GROQ_MODEL
    selected_temp = temperature if temperature is not None else ai_settings.DEFAULT_TEMPERATURE

    if force_mock or not ai_settings.has_groq_key:
        logger.info(
            "Initializing Groq LLM Provider in offline/mock mode for model '%s'",
            selected_model
        )
        return MockGroqLLM(model=selected_model)

    try:
        from langchain_groq import ChatGroq
        return ChatGroq(
            model=selected_model,
            temperature=selected_temp,
            api_key=ai_settings.GROQ_API_KEY,
            max_retries=ai_settings.MAX_RETRIES,
            timeout=ai_settings.REQUEST_TIMEOUT_SECONDS,
        )
    except ImportError:
        logger.warning(
            "langchain_groq package is not installed; falling back to mock provider."
        )
        return MockGroqLLM(model=selected_model)
