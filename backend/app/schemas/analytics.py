from pydantic import BaseModel
from typing import List

class StudentProgress(BaseModel):
    id: str
    name: str
    avatar: str
    grade: str
    lexileScore: int
    lexileGrowth: int
    storiesFinished: int
    quizAccuracy: int
    minutesReadThisWeek: int
    wordsMastered: int
    activeStory: str
    status: str

class ClassroomMetrics(BaseModel):
    medianLexile: int
    medianLexileGrowth: float
    averageQuizAccuracy: float
    totalMinutesReadWeek: int
    totalWordsMastered: int
    activeStudentsCount: int

class ReadingLogSubmission(BaseModel):
    studentId: str
    storyId: str
    minutesRead: int
    chapterId: str
