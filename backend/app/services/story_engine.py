import json
import uuid
from typing import Dict, Any, Optional
from app.core.config import settings
from app.models.story import ExploreTopicRequest, ExploreTopicResponse, VocabularyToken, CCSSQuizQuestion, ChapterNode, StoryChoiceItem, AgeMismatchAlertPayload
from app.services.safety_filter import safety_filter

try:
    from google import genai
    from google.genai import types
    has_genai = True
except ImportError:
    has_genai = False

class AIStoryEngine:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if has_genai and self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    async def explore_topic_and_generate(self, request: ExploreTopicRequest) -> ExploreTopicResponse:
        """
        Synthesizes an interactive branching educational storybook from an open-ended topic.
        Includes Tier-2 vocabulary tokens, CCSS comprehension questions, and age-mismatch checks.
        """
        # 1. Safety & Age-mismatch analysis
        eval_result = safety_filter.evaluate_topic(request.topic, request.target_grade_band)
        
        alert_payload: Optional[AgeMismatchAlertPayload] = None
        if eval_result.get("is_age_mismatch") and eval_result.get("alert"):
            raw_alert = eval_result["alert"]
            alert_payload = AgeMismatchAlertPayload(
                is_age_mismatch=True,
                topic=raw_alert["topic"],
                assessed_age=raw_alert["assessed_age"],
                target_age=raw_alert["target_age"],
                years_above=raw_alert["years_above"],
                message=raw_alert["message"],
                severity=raw_alert["severity"]
            )

        clean_topic = request.topic.strip()
        capitalized_topic = clean_topic.capitalize()
        story_id = f"story-{uuid.uuid4().hex[:8]}"

        # 2. Try Gemini API generation if client is available
        if self.client:
            try:
                prompt = f"""
                You are an award-winning children's author and CCSS reading curriculum specialist.
                Create an interactive story adventure for a student learning about: {clean_topic}
                Grade Band: {request.target_grade_band}
                Creativity Mode: {request.creativity_mode}

                Return JSON matching this exact structure:
                {{
                  "title": "A catchy title",
                  "subtitle": "An inspiring subtitle",
                  "lexile_level": "560L",
                  "chapter1": [
                    "First paragraph introducing the investigation of the topic.",
                    "Second paragraph detailing key observable evidence.",
                    "Third paragraph posing a dilemma."
                  ],
                  "chapter2": [
                    "Concluding paragraph demonstrating successful discovery."
                  ],
                  "vocabulary": [
                    {{
                      "word": "empirical",
                      "phonetic": "em-PEER-ih-kuhl",
                      "definition": "Verifiable by observation or experiment rather than pure theory.",
                      "example": "The scientist gathered empirical observations in the field.",
                      "tier": "Tier 2"
                    }}
                  ],
                  "quiz": {{
                    "question": "Comprehension question based on text evidence?",
                    "options": ["Correct answer", "Distractor 1", "Distractor 2", "Distractor 3"],
                    "correct_index": 0,
                    "explanation": "Why this answer is supported by the text.",
                    "ccss_standard": "CCSS.ELA-LITERACY.RI.3.1"
                  }}
                }}
                """
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.7 if request.creativity_mode == 'balanced' else (0.4 if request.creativity_mode == 'strict' else 0.9),
                    ),
                )
                data = json.loads(response.text)
                return ExploreTopicResponse(
                    story_id=story_id,
                    title=data.get("title", f"The Wonders of {capitalized_topic}"),
                    subtitle=data.get("subtitle", f"An interactive inquiry into {clean_topic}"),
                    cover_image_url="/src/assets/images/hero_storybook_adventure_1790130760499.jpg",
                    topic=clean_topic,
                    lexile_level=data.get("lexile_level", "560L"),
                    grade_level=request.target_grade_band,
                    estimated_minutes=8,
                    chapters={
                        "node-1": ChapterNode(
                            id="node-1",
                            title=f"Chapter 1: Investigating {capitalized_topic}",
                            content=data.get("chapter1", [
                                f"Our journey begins by examining the core principles of {clean_topic}."
                            ]),
                            choices=[
                                StoryChoiceItem(
                                    id="choice-1",
                                    text="Conduct an empirical simulation in the lab",
                                    next_node_id="node-2",
                                    theme_tag="Inquiry"
                                )
                            ],
                            is_ending=False
                        ),
                        "node-2": ChapterNode(
                            id="node-2",
                            title=f"Chapter 2: The Breakthrough Discovery",
                            content=data.get("chapter2", [
                                f"Through patient scientific testing, the mysteries of {clean_topic} were unlocked."
                            ]),
                            choices=[],
                            is_ending=True
                        )
                    },
                    vocabulary=[
                        VocabularyToken(**v) for v in data.get("vocabulary", [])
                    ],
                    quiz=CCSSQuizQuestion(
                        id="quiz-1",
                        question=data["quiz"]["question"],
                        options=data["quiz"]["options"],
                        correct_index=data["quiz"]["correct_index"],
                        explanation=data["quiz"]["explanation"],
                        xp_reward=60,
                        ccss_standard=data["quiz"].get("ccss_standard", "CCSS.ELA-LITERACY.RI.3.1")
                    ),
                    age_mismatch_alert=alert_payload
                )
            except Exception as e:
                print(f"Gemini API call failed ({e}), using curriculum fallback")

        # 3. High quality pedagogical fallback template
        return ExploreTopicResponse(
            story_id=story_id,
            title=f"The Expedition of {capitalized_topic}",
            subtitle=f"An inquisitive journey uncovering the secrets of {clean_topic}",
            cover_image_url="/src/assets/images/hero_storybook_adventure_1790130760499.jpg",
            topic=clean_topic,
            lexile_level="540L",
            grade_level=request.target_grade_band,
            estimated_minutes=8,
            chapters={
                "node-1": ChapterNode(
                    id="node-1",
                    title=f"Chapter 1: The Gateway to {capitalized_topic}",
                    content=[
                        f"Alex powered on the expedition sensors to analyze the first clues about {clean_topic}.",
                        f"Every breakthrough begins with keen observation. By studying the environment, Alex noted several anomalous patterns.",
                        f"Two avenues of inquiry lay ahead: conducting an empirical field experiment or checking the historical data log."
                    ],
                    choices=[
                        StoryChoiceItem(
                            id="choice-1",
                            text=f"Deploy the field scanner to study {clean_topic}",
                            next_node_id="node-2",
                            theme_tag="Scientific Method"
                        )
                    ],
                    is_ending=False
                ),
                "node-2": ChapterNode(
                    id="node-2",
                    title=f"Chapter 2: The Breakthrough in {capitalized_topic}",
                    content=[
                        f"The sensor telemetry confirmed the initial hypothesis with high precision!",
                        f"By demonstrating patience, curiosity, and systematic testing, Alex mastered the fundamentals of {clean_topic}."
                    ],
                    choices=[],
                    is_ending=True
                )
            },
            vocabulary=[
                VocabularyToken(
                    word="empirical",
                    phonetic="em-PEER-ih-kuhl",
                    definition="Based on, concerned with, or verifiable by observation rather than theory alone.",
                    example="Alex collected empirical evidence to verify the reading.",
                    tier="Tier 2",
                    mastered=False
                ),
                VocabularyToken(
                    word="hypothesis",
                    phonetic="hye-POTH-uh-sis",
                    definition="A testable proposed explanation made as a starting point for further inquiry.",
                    example="Their hypothesis proved accurate once the test concluded.",
                    tier="Tier 3",
                    mastered=True
                )
            ],
            quiz=CCSSQuizQuestion(
                id="quiz-1",
                question=f"What method did Alex use to begin investigating {clean_topic}?",
                options=[
                    "Careful observation and empirical data testing",
                    "Wild guessing without taking notes",
                    "Turning around and going home",
                    "Waiting for another explorer to do the work"
                ],
                correct_index=0,
                explanation="The narrative states that every breakthrough begins with keen observation and empirical testing.",
                xp_reward=50,
                ccss_standard="CCSS.ELA-LITERACY.RI.3.1"
            ),
            age_mismatch_alert=alert_payload
        )

ai_story_engine = AIStoryEngine()
