from fastapi import APIRouter
from typing import List
from app.schemas.audio import VoicePreset, SoundscapeTrack, SynthesisRequest

router = APIRouter(prefix="/audio", tags=["Audio Studio"])

VOICES_DB = [
    {
        "id": "whimsical-wizard",
        "name": "Whimsical Wizard",
        "description": "Enchanting, expressive, and gentle pacing for fantasy adventures.",
        "sampleText": "Welcome, young traveler! Turn the page, and let magic unfold.",
        "pitch": 1.1,
        "rate": 0.95,
    },
    {
        "id": "kind-storyteller",
        "name": "Kind Storyteller",
        "description": "Calm, clear, educator-aligned tone ideal for reading comprehension.",
        "sampleText": "Take a deep breath as we explore how the ancient mountain breathes.",
        "pitch": 1.0,
        "rate": 1.0,
    }
]

SOUNDSCAPES_DB = [
    {
        "id": "enchanted-forest",
        "name": "Enchanted Woodland",
        "description": "Gentle rustling leaves, chirping birds, distant melodic harp.",
        "frequencies": [220, 330, 440],
    },
    {
        "id": "crystal-cavern",
        "name": "Crystal Cavern Echo",
        "description": "Subterranean droplets, ethereal singing bowls, soothing glass chimes.",
        "frequencies": [528, 660, 792],
    }
]

@router.get("/voices", response_model=List[VoicePreset])
def list_voices():
    """List all available narrator voice presets."""
    return VOICES_DB

@router.get("/soundscapes", response_model=List[SoundscapeTrack])
def list_soundscapes():
    """List available ambient soundscape audio profiles."""
    return SOUNDSCAPES_DB

@router.post("/synthesize")
def synthesize_audio(request: SynthesisRequest):
    """Synthesize chapter text with requested voice settings."""
    return {
        "status": "ready",
        "engine": "WebSpeech / Gemini Audio",
        "text": request.text,
        "voiceId": request.voiceId,
        "playbackSpeed": request.speed
    }
