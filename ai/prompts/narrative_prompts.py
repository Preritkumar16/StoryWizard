"""
Prompts for the Narrative Architect Agent.
Responsible for generating engaging, age-appropriate educational narratives
with clear narrative progression, interactive branching, and vocabulary enrichment.
"""

NARRATIVE_ARCHITECT_SYSTEM_PROMPT = """You are the Narrative Architect Agent for AI StoryWizard, an educational storytelling platform for children aged 8-12.

Your role:
1. Craft an engaging, structured narrative based on the child's requested topic and personal interests.
2. Structure the story with a clear Beginning (Introduction), Middle (Climax/Challenge), and Ending (Resolution/Reflection).
3. Naturally weave the child's interests into the setting, characters, or challenges.
4. Adapt vocabulary, tone, and pacing to the target Grade Band:
   - Grade 1-2: Simple sentences, repetitive refrains, phonics-friendly vocabulary, high visual imagery.
   - Grade 3-4: Descriptive adjectives, compound sentences, introductory STEM concepts, curiosity hooks.
   - Grade 5-6: Dynamic dialogue, complex sentence structures, nuanced scientific/historical dilemmas.
5. Provide 2-3 interactive branching choice options for the reader to select next steps.
6. Highlight 2-4 Tier-2 vocabulary words with friendly child definitions.

CRITICAL INSTRUCTIONS:
- You are strictly a creative writer and story architect.
- You must output pure, valid JSON with NO extraneous markdown or commentary outside the JSON.
"""

def build_narrative_user_prompt(
    topic: str,
    interests: list,
    grade_band: str,
    learning_objective: str = "",
    story_requirements: dict = None,
) -> str:
    interests_str = ", ".join(interests) if interests else "exploration, animals, adventure"
    obj_str = learning_objective if learning_objective else f"Learn foundational concepts of {topic}"
    req_str = str(story_requirements) if story_requirements else "Standard 3-chapter structure"

    return f"""Please generate a structured educational story with the following requirements:

Target Topic: {topic}
Child Interests to incorporate: {interests_str}
Target Grade Band: {grade_band}
Primary Learning Objective: {obj_str}
Additional Requirements: {req_str}

Respond with a JSON object following this exact schema:
{{
  "title": "Engaging Title for Children",
  "grade_band": "{grade_band}",
  "topic": "{topic}",
  "summary": "Brief 2-sentence synopsis",
  "chapters": [
    {{
      "chapter_number": 1,
      "title": "Beginning Chapter Title",
      "content": "Rich narrative introducing the setting, character, and topic inquiry...",
      "vocabulary_focus": [
        {{"word": "example", "definition": "child-friendly definition", "context": "how used in sentence"}}
      ]
    }},
    {{
      "chapter_number": 2,
      "title": "Middle Chapter Title",
      "content": "Narrative challenge or experimentation illustrating the concept...",
      "vocabulary_focus": []
    }},
    {{
      "chapter_number": 3,
      "title": "Ending Chapter Title",
      "content": "Resolution applying the learned knowledge and celebrating discovery...",
      "vocabulary_focus": []
    }}
  ],
  "branching_options": [
    {{"choice_id": "choice_a", "label": "Option A action"}},
    {{"choice_id": "choice_b", "label": "Option B action"}}
  ],
  "word_count": 350
}}
"""
