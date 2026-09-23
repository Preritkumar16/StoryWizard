from pydantic import BaseModel
from typing import List, Optional

class VoicePreset(BaseModel):
    id: str
    name: str
    description: str
    sampleText: str
    pitch: float
    rate: float

class SoundscapeTrack(BaseModel):
    id: str
    name: str
    description: str
    frequencies: List[int]

class SynthesisRequest(BaseModel):
    text: str
    voiceId: str = "whimsical-wizard"
    speed: float = 1.0
    pitch: float = 1.0
