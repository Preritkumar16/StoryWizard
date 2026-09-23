from fastapi import APIRouter, HTTPException, status
from app.models.story import ExploreTopicRequest, ExploreTopicResponse
from app.services.story_engine import ai_story_engine

router = APIRouter(prefix="/stories", tags=["Stories"])

@router.post("/explore-topic", response_model=ExploreTopicResponse)
async def explore_topic(payload: ExploreTopicRequest):
    """
    Generates a personalized interactive branching story from a student topic inquiry.
    Includes Tier-2 vocabulary tokens, CCSS reading comprehension quizzes, and evaluates
    topic age-appropriateness against the target grade band.
    """
    if not payload.topic or len(payload.topic.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic query must be at least 2 characters"
        )
        
    try:
        response = await ai_story_engine.explore_topic_and_generate(payload)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate story for topic '{payload.topic}': {str(e)}"
        )
