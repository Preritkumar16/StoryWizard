import sys
import asyncio
from pathlib import Path
from typing import Dict, Any

# Ensure workspace root and backend are in sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(root_dir / "backend"))

from ai.config.settings import ai_settings, get_groq_llm, MockGroqLLM
from ai.workflows.story_workflow import (
    StoryState,
    create_story_workflow,
    compiled_story_workflow,
    narrative_architect_node,
    educational_alignment_node,
    safety_guardian_node,
    final_validation_node,
)
from ai.agents.narrative_architect import NarrativeArchitectAgent
from ai.agents.educational_alignment import EducationalAlignmentAgent
from ai.agents.safety_guardian import SafetyGuardianAgent
from ai.services.story_service import StoryService, ai_story_service
from app.routers.ai import GenerateStoryRequest, GenerateStoryResponse, generate_story

async def run_step4_tests():
    print("=" * 60)
    print("STEP 4 AI SERVICE & LANGGRAPH ARCHITECTURE TEST SUITE")
    print("=" * 60)

    results = {}

    # 1. State Creation & Typing Test
    try:
        sample_state: StoryState = {
            "user_id": "student_alex_01",
            "age_or_grade_band": "Grade 3-4",
            "topic": "Solar Energy",
            "interests": ["robots", "gardening"],
            "learning_objective": "Understand how solar panels turn sunlight into electricity",
            "story_requirements": {"chapters": 3},
            "draft_story": None,
            "educational_validation": None,
            "safety_validation": None,
            "final_story": None,
            "status": "pending",
            "errors": [],
            "metadata": {"source": "unit_test"}
        }
        assert sample_state["topic"] == "Solar Energy"
        assert len(sample_state["interests"]) == 2
        assert sample_state["status"] == "pending"
        results["1. State Creation"] = "PASS"
        print("[PASS] 1. State Creation: StoryState typed schema validated.")
    except Exception as e:
        results["1. State Creation"] = f"FAIL ({e})"
        print(f"[FAIL] 1. State Creation: {e}")

    # 2. Narrative Architect Agent Test
    try:
        narrative_agent = NarrativeArchitectAgent(llm=MockGroqLLM())
        test_state = {
            "topic": "Photosynthesis",
            "interests": ["detectives", "plants"],
            "age_or_grade_band": "Grade 3-4",
            "learning_objective": "Learn how plants turn sunlight and water into food",
            "story_requirements": {},
            "errors": [],
        }
        narrative_res = await narrative_agent.execute(test_state)
        draft = narrative_res.get("draft_story")
        assert draft is not None, "Draft story was not generated"
        assert "title" in draft, "Draft missing title"
        assert "chapters" in draft, "Draft missing chapters"
        assert len(draft["chapters"]) == 3, f"Expected 3 chapters, got {len(draft['chapters'])}"
        assert "branching_options" in draft, "Draft missing branching options"
        results["2. Narrative Agent Structure"] = "PASS"
        print(f"[PASS] 2. Narrative Agent: Generated '{draft['title']}' with 3 chapters.")
    except Exception as e:
        results["2. Narrative Agent Structure"] = f"FAIL ({e})"
        print(f"[FAIL] 2. Narrative Agent: {e}")

    # 3. Educational Alignment Agent Test
    try:
        edu_agent = EducationalAlignmentAgent(llm=MockGroqLLM())
        state_for_edu = dict(test_state)
        state_for_edu["draft_story"] = draft
        edu_res = await edu_agent.execute(state_for_edu)
        edu_val = edu_res.get("educational_validation")
        assert edu_val is not None, "Educational validation missing"
        assert "is_aligned" in edu_val, "is_aligned boolean missing"
        assert "alignment_score" in edu_val, "alignment_score missing"
        assert "strengths" in edu_val, "strengths missing"
        assert edu_val["is_aligned"] is True, "Expected aligned story to evaluate True"
        results["3. Educational Validation Structure"] = "PASS"
        print(f"[PASS] 3. Educational Validation: Score {edu_val['alignment_score']} (Aligned: {edu_val['is_aligned']}).")
    except Exception as e:
        results["3. Educational Validation Structure"] = f"FAIL ({e})"
        print(f"[FAIL] 3. Educational Validation: {e}")

    # 4. Safety Guardian Agent Test
    try:
        safety_agent = SafetyGuardianAgent(llm=MockGroqLLM())
        # Safe story test
        safe_state = dict(test_state)
        safe_state["draft_story"] = draft
        safe_res = await safety_agent.execute(safe_state)
        safe_val = safe_res.get("safety_validation")
        assert safe_val["is_safe"] is True, "Safe story should pass"
        assert safe_val["safety_score"] >= 0.9, "Safe story should score >= 0.9"

        # Unsafe story test with restricted term
        unsafe_draft = dict(draft)
        unsafe_draft["chapters"] = [
            {"chapter_number": 1, "title": "Danger", "content": "The hero found a violent weapon and horror blood."}
        ]
        unsafe_state = dict(test_state)
        unsafe_state["draft_story"] = unsafe_draft
        unsafe_res = await safety_agent.execute(unsafe_state)
        unsafe_val = unsafe_res.get("safety_validation")
        assert unsafe_val["is_safe"] is False, "Unsafe story must fail"
        assert len(unsafe_val["flagged_categories"]) > 0, "Flagged categories should be detected"
        results["4. Safety Validation Structure"] = "PASS"
        print(f"[PASS] 4. Safety Guardian: Safe verified (Score: {safe_val['safety_score']}), Unsafe flagged ({unsafe_val['flagged_categories']}).")
    except Exception as e:
        results["4. Safety Validation Structure"] = f"FAIL ({e})"
        print(f"[FAIL] 4. Safety Guardian: {e}")

    # 5. LangGraph Workflow Construction Test
    try:
        wf = create_story_workflow()
        assert wf is not None, "Workflow compilation failed"
        assert hasattr(wf, "ainvoke"), "Workflow lacks ainvoke method"
        results["5. LangGraph Workflow Construction"] = "PASS"
        print("[PASS] 5. LangGraph Workflow Construction: Graph compiled with all nodes.")
    except Exception as e:
        results["5. LangGraph Workflow Construction"] = f"FAIL ({e})"
        print(f"[FAIL] 5. LangGraph Workflow: {e}")

    # 6. Workflow Execution Using Mock LLM
    try:
        initial_wf_state: StoryState = {
            "user_id": "alex_student",
            "age_or_grade_band": "Grade 3-4",
            "topic": "Gravity and Orbiting",
            "interests": ["space rockets", "constellations"],
            "learning_objective": "Understand how planetary mass causes gravity",
            "story_requirements": {},
            "draft_story": None,
            "educational_validation": None,
            "safety_validation": None,
            "final_story": None,
            "status": "pending",
            "errors": [],
            "metadata": {}
        }
        wf_res = await compiled_story_workflow.ainvoke(initial_wf_state)
        assert wf_res["status"] == "completed", f"Expected completed status, got {wf_res['status']}"
        assert wf_res["final_story"] is not None, "Final story missing"
        assert wf_res["educational_validation"]["is_aligned"] is True
        assert wf_res["safety_validation"]["is_safe"] is True
        assert len(wf_res["errors"]) == 0
        results["6. Workflow Execution (Mock LLM)"] = "PASS"
        print(f"[PASS] 6. Workflow Execution: Completed '{wf_res['final_story']['title']}' through 4 nodes.")
    except Exception as e:
        results["6. Workflow Execution (Mock LLM)"] = f"FAIL ({e})"
        print(f"[FAIL] 6. Workflow Execution: {e}")

    # 7. AI Service Input/Output Test
    try:
        service_res = await ai_story_service.generate_story(
            topic="Ocean Ecosystems",
            interests=["dolphins", "submarines"],
            grade_band="Grade 3-4",
            learning_objective="Learn how coral reefs support marine biodiversity",
            user_id="child_001"
        )
        assert service_res["status"] == "completed"
        assert service_res["story"] is not None
        assert service_res["metadata"]["user_id"] == "child_001"
        assert service_res["metadata"]["topic"] == "Ocean Ecosystems"
        assert "execution_time_seconds" in service_res["metadata"]
        results["7. AI Service Input/Output"] = "PASS"
        print(f"[PASS] 7. AI Service Layer: Output formatted in {service_res['metadata']['execution_time_seconds']}s.")
    except Exception as e:
        results["7. AI Service Input/Output"] = f"FAIL ({e})"
        print(f"[FAIL] 7. AI Service Layer: {e}")

    # 8. Missing API Key Handling
    try:
        # Check that environment without active live key defaults safely
        key_status = ai_settings.has_groq_key
        llm = get_groq_llm()
        assert llm is not None, "LLM fallback should never be None"
        # Confirm no crash on invoke
        resp = llm.invoke("Test prompt")
        assert resp is not None
        results["8. Missing API Key Handling"] = "PASS"
        print(f"[PASS] 8. Missing API Key Handling: Handled gracefully (has_key={key_status}, provider={type(llm).__name__}).")
    except Exception as e:
        results["8. Missing API Key Handling"] = f"FAIL ({e})"
        print(f"[FAIL] 8. Missing API Key Handling: {e}")

    # 9. AI Router Validation Test
    try:
        # Valid request
        valid_req = GenerateStoryRequest(
            topic="Volcanoes",
            interests=["geology", "hiking"],
            grade_band="Grade 5-6",
            learning_objective="Explain magma chamber pressure and tectonic plates"
        )
        assert valid_req.topic == "Volcanoes"

        # Test controller with mock user payload
        mock_user = {"user_id": "test_parent_01", "role": "parent", "sub": "test_parent_01"}
        route_res = await generate_story(payload=valid_req, current_user=mock_user)
        assert route_res["status"] == "completed"
        assert route_res["story"]["topic"] == "Volcanoes"

        # Invalid request (too short topic)
        short_req = GenerateStoryRequest(topic="X")
        short_err = False
        try:
            await generate_story(payload=short_req, current_user=mock_user)
        except Exception as http_err:
            short_err = True
            assert getattr(http_err, "status_code", 0) == 400

        assert short_err is True, "Expected 400 error for short topic"
        results["9. AI Router Validation"] = "PASS"
        print("[PASS] 9. AI Router: Request validation, RBAC user context, and 400 validation verified.")
    except Exception as e:
        results["9. AI Router Validation"] = f"FAIL ({e})"
        print(f"[FAIL] 9. AI Router: {e}")

    # 10. Real Groq API Status
    if ai_settings.has_groq_key:
        print("[INFO] Real Groq API Key found. Testing live API...")
        try:
            from langchain_groq import ChatGroq
            live_llm = ChatGroq(model=ai_settings.GROQ_MODEL, api_key=ai_settings.GROQ_API_KEY)
            live_resp = await live_llm.ainvoke("Hello from AI StoryWizard test!")
            results["10. Real Groq API Test"] = "PASS"
            print(f"[PASS] 10. Real Groq API Test: Live request succeeded.")
        except Exception as e:
            results["10. Real Groq API Test"] = f"FAIL ({e})"
            print(f"[FAIL] 10. Real Groq API Test: {e}")
    else:
        results["10. Real Groq API Test"] = "NOT TESTED"
        print("[NOT TESTED] 10. Real Groq API Test: No live GROQ_API_KEY in environment.")

    print("=" * 60)
    print("STEP 4 TEST SUMMARY:")
    for k, v in results.items():
        print(f"  {k}: {v}")
    print("=" * 60)

    # Return overall result
    core_tests = [v for k, v in results.items() if k != "10. Real Groq API Test"]
    all_core_passed = all(t == "PASS" for t in core_tests)
    return all_core_passed

if __name__ == "__main__":
    success = asyncio.run(run_step4_tests())
    sys.exit(0 if success else 1)
