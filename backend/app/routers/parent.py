from fastapi import APIRouter, HTTPException, Path
from typing import Dict, Any
from app.models.parent import (
    ChildProgressResponse,
    TopicHistoryItem,
    LexileTrajectoryPoint,
    VocabMasteryItem,
    AgeMismatchNotification,
    ParentalControlsUpdate,
    ParentalControlsResponse
)

router = APIRouter(prefix="/parent", tags=["Parental Controls & Supervision"])

# In-memory mock database state for demo sandbox
DATABASE_CONTROLS = {
    "student-alex": {
        "max_daily_minutes": 30,
        "max_grade_band": "Grade 3-4",
        "ai_creativity": "balanced",
        "topic_safety_filter": True,
        "alert_on_age_mismatch": True
    }
}

DATABASE_ALERTS = [
    AgeMismatchNotification(
        id="alert-1",
        timestamp="Today at 3:15 PM",
        topic="Quantum Computing and Atomic Particles",
        assessed_age=13,
        target_age=8,
        difference_years=5,
        message="Alex searched for 'Quantum Computing and Atomic Particles' – rated 5 years above configured Grade 3-4 target band.",
        acknowledged=False
    )
]

@router.get("/child-progress/{child_id}", response_model=ChildProgressResponse)
async def get_child_progress(child_id: str = Path(..., description="The unique child ID")):
    """
    Retrieves full progress telemetry for a supervised child:
    - Topic curiosity history
    - Lexile growth trajectory points
    - Tier-2 vocabulary retention matrix
    - Age-mismatch alert log
    """
    controls = DATABASE_CONTROLS.get(child_id, {
        "max_daily_minutes": 30,
        "max_grade_band": "Grade 3-4"
    })

    return ChildProgressResponse(
        child_id=child_id,
        name="Alex Chen",
        grade="3rd Grade",
        current_lexile=545,
        minutes_read_today=18,
        max_daily_minutes=controls["max_daily_minutes"],
        topic_history=[
            TopicHistoryItem(
                id="th-1",
                topic="Bioluminescent Jellyfish",
                story_title="The Deep Trench Luminescence",
                date="Today, 3:45 PM",
                duration_minutes=14,
                words_learned=4,
                quiz_score=100,
                lexile="540L"
            ),
            TopicHistoryItem(
                id="th-2",
                topic="Volcanic Magma Chambers",
                story_title="Journey to the Caldera Core",
                date="Yesterday",
                duration_minutes=12,
                words_learned=3,
                quiz_score=90,
                lexile="510L"
            ),
            TopicHistoryItem(
                id="th-3",
                topic="Ancient Egyptian Hieroglyphs",
                story_title="The Scribe's Papyrus Riddle",
                date="3 days ago",
                duration_minutes=15,
                words_learned=5,
                quiz_score=100,
                lexile="520L"
            )
        ],
        lexile_trajectory=[
            LexileTrajectoryPoint(month="May", score=410),
            LexileTrajectoryPoint(month="Jun", score=445),
            LexileTrajectoryPoint(month="Jul", score=475),
            LexileTrajectoryPoint(month="Aug", score=500),
            LexileTrajectoryPoint(month="Sep", score=545)
        ],
        vocabulary_mastery=[
            VocabMasteryItem(
                word="luminescence",
                tier="Tier 2",
                definition="Light produced by chemical reactions or living organisms rather than heat.",
                status="Mastered",
                encounters=5
            ),
            VocabMasteryItem(
                word="subterranean",
                tier="Tier 2",
                definition="Existing, situated, or operating below the surface of the earth.",
                status="Mastered",
                encounters=4
            ),
            VocabMasteryItem(
                word="caldera",
                tier="Tier 3",
                definition="A large volcanic crater formed by a major eruption leading to the collapse of the mouth.",
                status="Needs Review",
                encounters=2
            )
        ],
        age_mismatch_alerts=DATABASE_ALERTS
    )

@router.put("/controls/{child_id}", response_model=ParentalControlsResponse)
async def update_parental_controls(
    payload: ParentalControlsUpdate,
    child_id: str = Path(..., description="The unique child ID")
):
    """
    Updates safety limits, maximum daily reading time, allowed grade band,
    and content filtering rules for a child.
    """
    current = DATABASE_CONTROLS.get(child_id, {
        "max_daily_minutes": 30,
        "max_grade_band": "Grade 3-4",
        "ai_creativity": "balanced",
        "topic_safety_filter": True,
        "alert_on_age_mismatch": True
    })

    update_dict = payload.model_dump(exclude_unset=True)
    current.update(update_dict)
    DATABASE_CONTROLS[child_id] = current

    return ParentalControlsResponse(
        status="success",
        message="Parental controls and safety filters updated successfully",
        controls=current
    )
