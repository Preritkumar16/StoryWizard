from fastapi import APIRouter, status
from typing import List
from app.schemas.analytics import StudentProgress, ClassroomMetrics, ReadingLogSubmission

router = APIRouter(prefix="/analytics", tags=["Educator Analytics"])

STUDENTS_DB: List[dict] = [
    {
        "id": "s-1",
        "name": "Leo Chen",
        "avatar": "/src/assets/images/avatar_explorer_leo_1790130804622.jpg",
        "grade": "3rd Grade",
        "lexileScore": 540,
        "lexileGrowth": 45,
        "storiesFinished": 12,
        "quizAccuracy": 94,
        "minutesReadThisWeek": 165,
        "wordsMastered": 42,
        "activeStory": "The Mystery of the Crystal Cavern",
        "status": "Ahead"
    },
    {
        "id": "s-2",
        "name": "Sophia Martinez",
        "avatar": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=128&q=80",
        "grade": "3rd Grade",
        "lexileScore": 510,
        "lexileGrowth": 30,
        "storiesFinished": 9,
        "quizAccuracy": 88,
        "minutesReadThisWeek": 130,
        "wordsMastered": 35,
        "activeStory": "Nova and the Starlight Compass",
        "status": "On Track"
    }
]

@router.get("/overview", response_model=ClassroomMetrics)
def get_classroom_overview():
    """Retrieve classroom-wide Lexile and comprehension metrics."""
    return ClassroomMetrics(
        medianLexile=566,
        medianLexileGrowth=37.6,
        averageQuizAccuracy=89.8,
        totalMinutesReadWeek=765,
        totalWordsMastered=218,
        activeStudentsCount=24
    )

@router.get("/students", response_model=List[StudentProgress])
def list_students():
    """Retrieve all student reading profiles for educator review."""
    return STUDENTS_DB

@router.post("/reading-session", status_code=status.HTTP_201_CREATED)
def record_reading_session(submission: ReadingLogSubmission):
    """Log reading time and node completion for a student."""
    return {"message": "Reading session logged successfully", "data": submission}
