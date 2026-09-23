from pydantic import BaseModel, Field
from typing import List, Optional

class TopicHistoryItem(BaseModel):
    id: str
    topic: str
    story_title: str
    date: str
    duration_minutes: int
    words_learned: int
    quiz_score: int
    lexile: str

class LexileTrajectoryPoint(BaseModel):
    month: str
    score: int

class VocabMasteryItem(BaseModel):
    word: str
    tier: str
    definition: str
    status: str
    encounters: int

class AgeMismatchNotification(BaseModel):
    id: str
    timestamp: str
    topic: str
    assessed_age: int
    target_age: int
    difference_years: int
    message: str
    acknowledged: bool = False

class ChildProgressResponse(BaseModel):
    child_id: str
    name: str
    grade: str
    current_lexile: int
    minutes_read_today: int
    max_daily_minutes: int
    topic_history: List[TopicHistoryItem]
    lexile_trajectory: List[LexileTrajectoryPoint]
    vocabulary_mastery: List[VocabMasteryItem]
    age_mismatch_alerts: List[AgeMismatchNotification]

class ParentalControlsUpdate(BaseModel):
    max_daily_minutes: Optional[int] = Field(None, ge=10, le=120, example=30)
    max_grade_band: Optional[str] = Field(None, example="Grade 3-4")
    ai_creativity: Optional[str] = Field(None, example="balanced")
    topic_safety_filter: Optional[bool] = Field(None, example=True)
    alert_on_age_mismatch: Optional[bool] = Field(None, example=True)

class ParentalControlsResponse(BaseModel):
    status: str = "success"
    message: str
    controls: dict
