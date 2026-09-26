import time
import logging
from typing import Dict, Any, List, Optional
from ai.workflows.story_workflow import (
    StoryState,
    compiled_story_workflow,
    create_story_workflow,
)
from ai.config.settings import ai_settings

logger = logging.getLogger("ai_storywizard.ai.service")

class StoryService:
    """
    AI Story Service Layer.
    Acts as the clean architectural bridge between FastAPI controllers and the
    LangGraph Multi-Agent execution engine.
    Encapsulates state formulation, execution benchmarking, and structured error handling.
    """
    def __init__(self, workflow: Optional[Any] = None):
        self.workflow = workflow or compiled_story_workflow

    async def generate_story(
        self,
        topic: str,
        interests: Optional[List[str]] = None,
        grade_band: str = "Grade 3-4",
        learning_objective: Optional[str] = None,
        story_requirements: Optional[Dict[str, Any]] = None,
        user_id: str = "anonymous_student",
    ) -> Dict[str, Any]:
        """
        Generates a verified educational narrative through the Multi-Agent LangGraph workflow.
        Returns a clean structured result containing story, educational validation,
        safety validation, execution metadata, and status.
        """
        start_time = time.perf_counter()
        
        # 1. Normalize and validate input parameters
        clean_topic = topic.strip() if topic else "General Science"
        clean_interests = [i.strip() for i in (interests or []) if i and i.strip()]
        clean_grade = grade_band.strip() if grade_band else "Grade 3-4"
        clean_objective = (
            learning_objective.strip()
            if learning_objective
            else f"Understand foundational principles of {clean_topic}"
        )
        requirements = story_requirements or {}

        # 2. Formulate typed initial LangGraph state
        initial_state: StoryState = {
            "user_id": user_id,
            "age_or_grade_band": clean_grade,
            "topic": clean_topic,
            "interests": clean_interests,
            "learning_objective": clean_objective,
            "story_requirements": requirements,
            "draft_story": None,
            "educational_validation": None,
            "safety_validation": None,
            "final_story": None,
            "status": "pending",
            "errors": [],
            "metadata": {
                "groq_model": ai_settings.GROQ_MODEL,
                "has_api_key": ai_settings.has_groq_key,
            }
        }

        # 3. Execute LangGraph workflow
        try:
            logger.info(
                "Initiating Multi-Agent story generation for user='%s', topic='%s'",
                user_id, clean_topic
            )
            result_state = await self.workflow.ainvoke(initial_state)
            execution_duration = round(time.perf_counter() - start_time, 3)

            # 4. Synthesize structured output
            status = result_state.get("status", "completed")
            final_story = result_state.get("final_story")
            edu_validation = result_state.get("educational_validation")
            safety_validation = result_state.get("safety_validation")
            errors = result_state.get("errors", [])

            return {
                "status": status,
                "story": final_story,
                "educational_validation": edu_validation,
                "safety_validation": safety_validation,
                "metadata": {
                    "user_id": user_id,
                    "topic": clean_topic,
                    "grade_band": clean_grade,
                    "model": ai_settings.GROQ_MODEL,
                    "live_api_invoked": ai_settings.has_groq_key,
                    "execution_time_seconds": execution_duration,
                },
                "errors": errors,
            }

        except Exception as exc:
            execution_duration = round(time.perf_counter() - start_time, 3)
            logger.error("Story workflow execution failed: %s", exc)
            return {
                "status": "failed",
                "story": None,
                "educational_validation": None,
                "safety_validation": None,
                "metadata": {
                    "user_id": user_id,
                    "topic": clean_topic,
                    "grade_band": clean_grade,
                    "model": ai_settings.GROQ_MODEL,
                    "live_api_invoked": ai_settings.has_groq_key,
                    "execution_time_seconds": execution_duration,
                },
                "errors": [f"Workflow execution error: {str(exc)}"],
            }

# Singleton instance for route controllers
ai_story_service = StoryService()
