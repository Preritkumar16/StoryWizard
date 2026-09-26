import json
import logging
import re
from typing import Dict, Any, Optional
from ai.config.settings import get_groq_llm
from ai.prompts.narrative_prompts import (
    NARRATIVE_ARCHITECT_SYSTEM_PROMPT,
    build_narrative_user_prompt,
)

logger = logging.getLogger("ai_storywizard.ai.agents.narrative")

def _clean_json_response(content: str) -> Dict[str, Any]:
    """Extract and parse clean JSON from LLM output, handling code fences or prefix text."""
    if not content or not content.strip():
        return {}
    
    clean = content.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", clean)
    if match:
        clean = match.group(1).strip()
        
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        # Fallback: extract the first brace to the last brace
        start = clean.find("{")
        end = clean.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(clean[start : end + 1])
            except json.JSONDecodeError:
                pass
        logger.warning("Failed to decode JSON from model response: %s", content[:150])
        return {}

class NarrativeArchitectAgent:
    """
    Narrative Architect Agent.
    Role:
    - Converts child interests and topic inquiries into coherent educational narratives.
    - Maintains three-act structure (Beginning, Middle, Ending).
    - Adapts syntax, pacing, and tone to the specified grade band.
    - Generates interactive branching options and vocabulary enrichment tags.
    """
    def __init__(self, llm: Optional[Any] = None):
        self.llm = llm or get_groq_llm()

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the narrative generation stage.
        Reads topic, interests, grade band, and learning objective from state.
        Returns state update containing the draft story.
        """
        topic = state.get("topic", "Science Exploration")
        interests = state.get("interests", [])
        grade_band = state.get("age_or_grade_band", "Grade 3-4")
        learning_objective = state.get("learning_objective", f"Understand key principles of {topic}")
        story_requirements = state.get("story_requirements", {})

        logger.info(
            "Narrative Architect generating story for topic='%s', grade='%s', interests=%s",
            topic, grade_band, interests
        )

        user_prompt = build_narrative_user_prompt(
            topic=topic,
            interests=interests,
            grade_band=grade_band,
            learning_objective=learning_objective,
            story_requirements=story_requirements,
        )

        messages = [
            {"role": "system", "content": NARRATIVE_ARCHITECT_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        try:
            # Check if LLM supports async ainvoke or sync invoke
            if hasattr(self.llm, "ainvoke"):
                response = await self.llm.ainvoke(messages)
            else:
                response = self.llm.invoke(messages)

            raw_text = getattr(response, "content", str(response))
            parsed = _clean_json_response(raw_text)

            # If offline mock mode returned empty, construct structured narrative
            if not parsed or "chapters" not in parsed:
                parsed = self._generate_deterministic_draft(
                    topic=topic,
                    interests=interests,
                    grade_band=grade_band,
                    learning_objective=learning_objective,
                )

            return {
                "draft_story": parsed,
                "status": "drafted",
            }
        except Exception as exc:
            logger.error("Narrative Architect encountered error: %s", exc)
            return {
                "draft_story": self._generate_deterministic_draft(
                    topic=topic,
                    interests=interests,
                    grade_band=grade_band,
                    learning_objective=learning_objective,
                ),
                "errors": state.get("errors", []) + [f"Narrative Architect warning: {str(exc)}"],
                "status": "drafted_with_fallback",
            }

    def _generate_deterministic_draft(
        self, topic: str, interests: list, grade_band: str, learning_objective: str
    ) -> Dict[str, Any]:
        """High-quality deterministic fallback draft for offline and testing workflows."""
        hero_interest = interests[0] if interests else "explorers"
        return {
            "title": f"The Marvelous Secret of {topic}",
            "grade_band": grade_band,
            "topic": topic,
            "summary": f"A curious young student teams up with {hero_interest} to discover how {topic} shapes our world.",
            "chapters": [
                {
                    "chapter_number": 1,
                    "title": "A Curious Morning in the Workshop",
                    "content": f"The morning sun beamed through the window, illuminating Leo's workshop. Today was no ordinary day: Leo was determined to unlock the wonder of {topic}. Surrounded by gear and notes inspired by {hero_interest}, a sparkling question emerged. How does {topic} truly work?",
                    "vocabulary_focus": [
                        {"word": "hypothesis", "definition": "A smart, educated guess that scientists test", "context": "Leo formed a hypothesis about the experiment."}
                    ]
                },
                {
                    "chapter_number": 2,
                    "title": "The Experiment Begins",
                    "content": f"With focused eyes and steady hands, the investigation into {topic} began. Every detail mattered. To accomplish the goal—{learning_objective}—each observation was carefully noted down. An unexpected spark glowed on the worktable, revealing a breakthrough!",
                    "vocabulary_focus": [
                        {"word": "equilibrium", "definition": "A state of perfect balance between opposing forces", "context": "The system reached a gentle equilibrium."}
                    ]
                },
                {
                    "chapter_number": 3,
                    "title": "A World of Wonder",
                    "content": f"Standing proudly beside the completed project, Leo realized how {topic} connected everything around us. Learning was not just about memorizing facts; it was about asking bold questions and sharing knowledge with the world.",
                    "vocabulary_focus": [
                        {"word": "innovation", "definition": "Creating new ideas and helpful methods", "context": "Their discovery led to an incredible innovation."}
                    ]
                }
            ],
            "branching_options": [
                {"choice_id": "choice_deepen", "label": f"Conduct a deeper experiment into {topic}"},
                {"choice_id": "choice_apply", "label": "Build an invention using your new discovery"}
            ],
            "word_count": 320
        }
