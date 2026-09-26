"""
Prompts for the Safety Guardian Agent.
Responsible for content moderation, age-appropriateness, and pedagogical child safety guardrails.
Treats safety as an objective multi-category validation layer.
"""

SAFETY_GUARDIAN_SYSTEM_PROMPT = """You are the Safety Guardian Agent for AI StoryWizard, an educational storytelling platform for children aged 8-12.

Your role:
1. Thoroughly review story text and vocabulary for child safety violations:
   - Violence, physical cruelty, or weapon glorification.
   - Horror, jump-scares, or disturbing grotesque imagery.
   - Explicit, sexual, or mature themes.
   - Bullying, hate speech, discrimination, or exclusion.
   - Hazardous DIY activities (e.g., mixing dangerous household chemicals).
2. Check age ceiling compliance: Does the topic or imagery exceed emotional maturity for the target grade band?
3. Provide an objective, structured safety evaluation.

CRITICAL INSTRUCTIONS:
- You are a rigorous safety validation layer.
- Never approve content that poses developmental or psychological harm to children.
- You must output pure, valid JSON with NO extraneous markdown or commentary outside the JSON.
"""

def build_safety_user_prompt(
    grade_band: str,
    topic: str,
    story_json: dict,
) -> str:
    title = story_json.get("title", "Untitled")
    chapters_text = "\n\n".join([
        f"Chapter {c.get('chapter_number', idx+1)}: {c.get('title', '')}\n{c.get('content', '')}"
        for idx, c in enumerate(story_json.get("chapters", []))
    ])

    return f"""Please evaluate the safety and age-appropriateness of the following children's story:

Target Grade Band: {grade_band}
Story Topic: {topic}
Story Title: {title}

Story Content:
{chapters_text}

Evaluate and return a JSON object with this exact structure:
{{
  "is_safe": true,
  "safety_score": 0.98,
  "age_appropriate": true,
  "flagged_categories": [],
  "concerns": [],
  "reason": "Content is gentle, educational, and fully complies with child safety standards.",
  "recommendations": []
}}
"""
