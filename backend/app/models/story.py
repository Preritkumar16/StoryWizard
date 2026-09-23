from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class VocabularyToken(BaseModel):
    word: str
    phonetic: str
    definition: str
    example: str
    tier: str = "Tier 2"
    mastered: bool = False

class CCSSQuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_index: int
    explanation: str
    xp_reward: int = 50
    ccss_standard: str = "CCSS.ELA-LITERACY.RI.3.1"

class StoryChoiceItem(BaseModel):
    id: str
    text: str
    next_node_id: str
    theme_tag: Optional[str] = None

class ChapterNode(BaseModel):
    id: str
    title: str
    content: List[str]
    choices: List[StoryChoiceItem] = []
    is_ending: bool = False

class AgeMismatchAlertPayload(BaseModel):
    is_age_mismatch: bool
    topic: str
    assessed_age: int
    target_age: int
    years_above: int
    message: str
    severity: str = "warning"

class ExploreTopicRequest(BaseModel):
    topic: str = Field(..., example="Bioluminescent Jellyfish")
    child_id: str = Field(default="student-alex", example="student-alex")
    target_grade_band: str = Field(default="Grade 3-4", example="Grade 3-4")
    creativity_mode: str = Field(default="balanced", example="balanced")

class ExploreTopicResponse(BaseModel):
    story_id: str
    title: str
    subtitle: str
    cover_image_url: str
    topic: str
    lexile_level: str
    grade_level: str
    estimated_minutes: int
    chapters: Dict[str, ChapterNode]
    vocabulary: List[VocabularyToken]
    quiz: CCSSQuizQuestion
    age_mismatch_alert: Optional[AgeMismatchAlertPayload] = None
