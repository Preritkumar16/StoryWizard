import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging

try:
    from fastapi import APIRouter, HTTPException, Depends, status
    from pydantic import BaseModel, Field
except ImportError:
    class APIRouter:
        def __init__(self, *args, **kwargs):
            self.routes = []
        def post(self, *args, **kwargs):
            def decorator(func):
                return func
            return decorator
    class HTTPException(Exception):
        def __init__(self, status_code=500, detail="", headers=None):
            super().__init__(detail)
            self.status_code = status_code
            self.detail = detail
            self.headers = headers
    def Depends(dep=None):
        return dep
    class StatusMock:
        HTTP_400_BAD_REQUEST = 400
        HTTP_401_UNAUTHORIZED = 401
        HTTP_403_FORBIDDEN = 403
        HTTP_500_INTERNAL_SERVER_ERROR = 500
    status = StatusMock()
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__
    def Field(default=None, **kwargs):
        return default


# Ensure project root is in sys.path to access the ai/ package
project_root = Path(__file__).resolve().parent.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from app.core.security import get_current_user_payload, require_role
from ai.services.story_service import ai_story_service

logger = logging.getLogger("ai_storywizard.routers.ai")

router = APIRouter(prefix="/ai", tags=["AI Multi-Agent Engine"])

class GenerateStoryRequest(BaseModel):
    topic: str = Field(..., min_length=2, description="Target educational topic or inquiry")
    interests: List[str] = Field(default=[], description="Child personal interests to weave into narrative")
    grade_band: str = Field(default="Grade 3-4", description="Target grade band: 'Grade 1-2', 'Grade 3-4', or 'Grade 5-6'")
    learning_objective: Optional[str] = Field(default=None, description="Pedagogical objective to fulfill")
    story_requirements: Optional[Dict[str, Any]] = Field(default=None, description="Optional custom constraints")

class GenerateStoryResponse(BaseModel):
    status: str
    story: Optional[Dict[str, Any]] = None
    educational_validation: Optional[Dict[str, Any]] = None
    safety_validation: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any]
    errors: List[str] = []

@router.post(
    "/generate-story",
    response_model=GenerateStoryResponse,
    summary="Generate and validate an educational story via LangGraph multi-agent workflow"
)
async def generate_story(
    payload: GenerateStoryRequest,
    current_user: Dict[str, Any] = Depends(require_role(["student", "parent"]))
):
    """
    Step 4 AI Story Generation Endpoint.
    Orchestrates the Multi-Agent LangGraph workflow:
    1. Narrative Architect Agent drafts narrative
    2. Educational Alignment Agent verifies concepts
    3. Safety Guardian Agent verifies child safety
    4. Final validation synthesizes the result
    
    Protected by Step 3 RBAC (student or parent access).
    """
    if not payload.topic or len(payload.topic.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic must be at least 2 characters in length."
        )

    user_id = current_user.get("user_id") or current_user.get("sub") or "student_user"

    try:
        result = await ai_story_service.generate_story(
            topic=payload.topic,
            interests=payload.interests,
            grade_band=payload.grade_band,
            learning_objective=payload.learning_objective,
            story_requirements=payload.story_requirements,
            user_id=user_id,
        )

        return result

    except Exception as exc:
        logger.error("AI Story generation failed unexpectedly: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Story generation error: {str(exc)}"
        )
