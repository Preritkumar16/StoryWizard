from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class VocabularyItem(BaseModel):
    word: str
    phonetic: str
    definition: str
    example: str
    mastered: bool = False

class ComprehensionQuiz(BaseModel):
    id: str
    question: str
    options: List[str]
    correctIndex: int
    explanation: str
    xpReward: int = 50

class StoryChoice(BaseModel):
    id: str
    text: str
    nextNodeId: str
    themeTag: Optional[str] = None

class StoryNode(BaseModel):
    id: str
    title: str
    content: List[str]
    illustration: Optional[str] = None
    choices: List[StoryChoice] = []
    vocabulary: List[VocabularyItem] = []
    quiz: Optional[ComprehensionQuiz] = None
    isEnding: bool = False

class StoryBase(BaseModel):
    id: str
    title: str
    subtitle: str
    coverImage: str
    genre: str
    ageRange: str
    lexileLevel: str
    estimatedMinutes: int
    tags: List[str] = []
    summary: str
    initialNodeId: str
    nodes: Dict[str, StoryNode]

class StoryGenerateRequest(BaseModel):
    heroType: str = Field(..., example="Young Inventor")
    sidekick: str = Field(..., example="Glowing Fox")
    setting: str = Field(..., example="Crystal Caverns")
    theme: str = Field(..., example="Curiosity & Science")
    lexileLevel: str = Field(..., example="520L")

class QuizSubmitRequest(BaseModel):
    selectedAnswerIndex: int
    studentId: str = "user-leo"

class QuizSubmitResponse(BaseModel):
    isCorrect: bool
    correctIndex: int
    explanation: str
    xpEarned: int
