import logging
from typing import Dict, Any, Optional
from ai.config.settings import get_groq_llm
from ai.prompts.safety_prompts import (
    SAFETY_GUARDIAN_SYSTEM_PROMPT,
    build_safety_user_prompt,
)
from ai.agents.narrative_architect import _clean_json_response

logger = logging.getLogger("ai_storywizard.ai.agents.safety")

RESTRICTED_TERMS = [
    "violence", "weapon", "horror", "gore", "explicit", "blood", "kill", "murder",
    "poison", "gun", "knife", "terror", "nightmare", "abuse", "drugs", "suicide"
]

class SafetyGuardianAgent:
    """
    Safety Guardian Agent.
    Role:
    - Inspects story text, chapter titles, and vocabulary for age-inappropriate or unsafe content.
    - Evaluates violence, cruelty, sexual themes, horror/fright, hate speech, and physical danger.
    - Assesses developmental suitability for the target grade band.
    - Acts as an essential pedagogical validation and safety layer.
    """
    def __init__(self, llm: Optional[Any] = None):
        self.llm = llm or get_groq_llm()

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates the draft story for safety compliance.
        Updates state with 'safety_validation'.
        """
        draft_story = state.get("draft_story") or {}
        topic = state.get("topic", "")
        grade_band = state.get("age_or_grade_band", "Grade 3-4")

        logger.info(
            "Safety Guardian Agent inspecting story '%s' for topic='%s' (grade='%s')",
            draft_story.get("title", "Untitled"), topic, grade_band
        )

        # 1. Deterministic baseline safety check
        heuristic_result = self._check_safety_heuristically(
            grade_band=grade_band,
            topic=topic,
            story_json=draft_story
        )

        # If deterministic rules flag severe violations immediately, fail fast
        if not heuristic_result["is_safe"]:
            return {
                "safety_validation": heuristic_result,
                "status": "safety_failed",
            }

        # 2. LLM contextual safety inspection
        user_prompt = build_safety_user_prompt(
            grade_band=grade_band,
            topic=topic,
            story_json=draft_story,
        )

        messages = [
            {"role": "system", "content": SAFETY_GUARDIAN_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        try:
            if hasattr(self.llm, "ainvoke"):
                response = await self.llm.ainvoke(messages)
            else:
                response = self.llm.invoke(messages)

            raw_text = getattr(response, "content", str(response))
            parsed = _clean_json_response(raw_text)

            if not parsed or "is_safe" not in parsed:
                parsed = heuristic_result

            return {
                "safety_validation": parsed,
                "status": "safety_validated",
            }
        except Exception as exc:
            logger.error("Safety Guardian Agent encountered error: %s", exc)
            return {
                "safety_validation": heuristic_result,
                "errors": state.get("errors", []) + [f"Safety Guardian warning: {str(exc)}"],
                "status": "safety_validated_with_fallback",
            }

    def _check_safety_heuristically(
        self, grade_band: str, topic: str, story_json: dict
    ) -> Dict[str, Any]:
        """Deterministic safety inspection against restricted terminology and age metrics."""
        text_corpus = (
            topic + " " +
            story_json.get("title", "") + " " +
            story_json.get("summary", "") + " " +
            " ".join([c.get("content", "") for c in story_json.get("chapters", [])])
        ).lower()

        flagged = []
        for term in RESTRICTED_TERMS:
            if term in text_corpus:
                flagged.append(term)

        if flagged:
            return {
                "is_safe": False,
                "safety_score": 0.15,
                "age_appropriate": False,
                "flagged_categories": flagged,
                "concerns": [f"Contains restricted or prohibited term: '{t}'" for t in flagged],
                "reason": f"Content violates safety guidelines due to flagged terms: {', '.join(flagged)}.",
                "recommendations": ["Remove harmful vocabulary and replace with positive educational themes."]
            }

        return {
            "is_safe": True,
            "safety_score": 0.99,
            "age_appropriate": True,
            "flagged_categories": [],
            "concerns": [],
            "reason": "Content is age-appropriate, positive, and compliant with child protection criteria.",
            "recommendations": []
        }
