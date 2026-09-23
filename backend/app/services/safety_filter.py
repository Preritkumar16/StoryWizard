from typing import Dict, Any, Tuple

class SafetyFilterService:
    # High-level academic thresholds (Age ratings)
    COMPLEX_TOPICS = {
        "quantum": 13,
        "relativity": 13,
        "neuroscience": 12,
        "calculus": 14,
        "crispr": 13,
        "gene editing": 13,
        "nuclear": 12,
        "cryptography": 12,
        "artificial intelligence": 11,
        "cybersecurity": 11,
        "microbiology": 11,
    }

    GRADE_BAND_BASE_AGES = {
        "Grade 1-2": 7,
        "Grade 3-4": 8,
        "Grade 5-6": 10,
    }

    RESTRICTED_TERMS = ["violence", "weapon", "horror", "gore", "explicit"]

    def evaluate_topic(self, topic: str, target_grade_band: str = "Grade 3-4") -> Dict[str, Any]:
        """
        Validates safety compliance and assesses whether the topic represents an
        age-mismatch exceeding the child's configured grade band ceiling.
        """
        lower_topic = topic.lower().strip()

        # 1. Check prohibited content
        for term in self.RESTRICTED_TERMS:
            if term in lower_topic:
                return {
                    "is_safe": False,
                    "is_age_mismatch": False,
                    "reason": f"Topic violates child safety guardrails ({term})"
                }

        # 2. Check age appropriateness
        target_age = self.GRADE_BAND_BASE_AGES.get(target_grade_band, 8)
        assessed_age = 8  # Default baseline for children's STEM topics

        for key, age_rating in self.COMPLEX_TOPICS.items():
            if key in lower_topic:
                assessed_age = max(assessed_age, age_rating)

        years_above = max(0, assessed_age - target_age)
        is_mismatch = years_above >= 3

        alert_payload = None
        if is_mismatch:
            alert_payload = {
                "is_age_mismatch": True,
                "topic": topic,
                "assessed_age": assessed_age,
                "target_age": target_age,
                "years_above": years_above,
                "message": f"Alert: Alex searched for '{topic}' – rated {years_above} years above target age ({target_grade_band})",
                "severity": "warning"
            }

        return {
            "is_safe": True,
            "is_age_mismatch": is_mismatch,
            "alert": alert_payload
        }

safety_filter = SafetyFilterService()
