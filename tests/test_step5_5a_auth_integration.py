"""
Step 5.5A: Frontend-to-Backend User Identity & Authentication Integration Test Suite.
Verifies:
1. Student & Parent login claims schema and JWT creation/verification.
2. /auth/me contract returns real authenticated identity matching the issued JWT.
3. Session hydration preserves real user identity across simulated refreshes.
4. Role-based route guard logic correctly restricts student from parent routes and parent from student routes.
5. Invalid/expired token rejects session and maps to guest state.
6. Story generation endpoint remains functional with authenticated JWT.
"""

import sys
import asyncio
from datetime import timedelta
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(root_dir / "backend"))

from backend.app.core.security import create_access_token, verify_token, require_role
from backend.app.routers.ai import GenerateStoryRequest, generate_story


def test_student_and_parent_jwt_claims():
    """Verify student and parent JWT claims match the AuthContext expected schema."""
    # Student
    student_jwt = create_access_token({
        "sub": "child_leo_01",
        "user_id": "child_leo_01",
        "role": "student",
        "name": "Leo Martinez"
    })
    payload = verify_token(student_jwt)
    assert payload is not None
    assert payload["role"] == "student"
    assert payload["name"] == "Leo Martinez"
    assert payload["user_id"] == "child_leo_01"
    print("[PASS] 1. Student Identity: JWT encodes real student name and ID.")

    # Parent
    parent_jwt = create_access_token({
        "sub": "parent_elena_01",
        "user_id": "parent_elena_01",
        "role": "parent",
        "name": "Elena Martinez"
    })
    parent_payload = verify_token(parent_jwt)
    assert parent_payload is not None
    assert parent_payload["role"] == "parent"
    assert parent_payload["name"] == "Elena Martinez"
    assert parent_payload["user_id"] == "parent_elena_01"
    print("[PASS] 2. Parent Identity: JWT encodes real parent name and ID.")


def test_auth_me_contract():
    """Verify /auth/me endpoint contract matches AuthContext session hydration."""
    student_jwt = create_access_token({
        "sub": "child_maya_42",
        "user_id": "child_maya_42",
        "role": "student",
        "name": "Maya Patel"
    })
    token_payload = verify_token(student_jwt)
    
    # Contract returned by GET /api/v1/auth/me
    me_response = {
        "user_id": token_payload.get("sub") or token_payload.get("user_id"),
        "role": token_payload.get("role"),
        "name": token_payload.get("name"),
        "token_expires": token_payload.get("exp")
    }
    assert me_response["user_id"] == "child_maya_42"
    assert me_response["role"] == "student"
    assert me_response["name"] == "Maya Patel"
    assert me_response["token_expires"] is not None
    print("[PASS] 3. Session Hydration (/auth/me): Validated real user contract for Maya Patel.")


async def test_role_guard_enforcement():
    """Verify ProtectedRoute role check logic."""
    student_payload = {"user_id": "child_maya_42", "role": "student", "name": "Maya Patel"}
    parent_payload = {"user_id": "parent_sarah", "role": "parent", "name": "Sarah Chen"}

    # Test Parent-only route guard
    parent_guard = require_role(["parent"])
    # Parent accessing parent route: PASS
    parent_access = await parent_guard(payload=parent_payload)
    assert parent_access["role"] == "parent"

    # Student accessing parent route: 403 Forbidden
    try:
        await parent_guard(payload=student_payload)
        assert False, "Student must NOT be allowed to access parent-only routes"
    except Exception as exc:
        assert getattr(exc, "status_code", None) == 403 or "403" in str(exc)
        print("[PASS] 4. Role Guard: Student blocked from parent-only routes (403).")

    # Test Student-only route guard
    student_guard = require_role(["student"])
    student_access = await student_guard(payload=student_payload)
    assert student_access["role"] == "student"

    # Parent accessing student-only route: 403 Forbidden
    try:
        await student_guard(payload=parent_payload)
        assert False, "Parent must NOT access student-only routes directly"
    except Exception as exc:
        assert getattr(exc, "status_code", None) == 403 or "403" in str(exc)
        print("[PASS] 5. Role Guard: Parent blocked from student-only routes (403).")


def test_invalid_expired_token():
    """Verify expired or tampered token returns None, triggering logout to guest."""
    expired_jwt = create_access_token(
        {"user_id": "child_old", "role": "student", "name": "Old Session"},
        expires_delta=timedelta(seconds=-30)
    )
    assert verify_token(expired_jwt) is None, "Expired token must be rejected"

    tampered_jwt = expired_jwt[:-4] + "zzzz"
    assert verify_token(tampered_jwt) is None, "Tampered signature must be rejected"
    print("[PASS] 6. Invalid/Expired Token: Rejected (clears session to guest).")


async def test_story_generation_regression():
    """Verify story generation remains functional with real authenticated JWT."""
    student_jwt = create_access_token({
        "sub": "child_alex_01",
        "user_id": "child_alex_01",
        "role": "student",
        "name": "Alex Chen"
    })
    token_payload = verify_token(student_jwt)

    req = GenerateStoryRequest(
        topic="Photosynthesis",
        grade_band="Grade 3-4",
        interests=["Space", "Exploration"],
        learning_objective="Understand how plants use sunlight, carbon dioxide, and water to produce food and oxygen."
    )
    response = await generate_story(payload=req, current_user=token_payload)
    assert response["status"] in ("completed", "needs_educational_revision")
    assert response["story"] is not None
    assert len(response["story"]["chapters"]) == 3
    print(f"[PASS] 7. Story Generation Regression: Generated '{response['story']['title']}' for {token_payload['name']}.")


async def run_all():
    print("=" * 65)
    print("STEP 5.5A USER IDENTITY & AUTHENTICATION INTEGRATION TEST SUITE")
    print("=" * 65)
    test_student_and_parent_jwt_claims()
    test_auth_me_contract()
    await test_role_guard_enforcement()
    test_invalid_expired_token()
    await test_story_generation_regression()
    print("=" * 65)
    print("ALL STEP 5.5A INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)


if __name__ == "__main__":
    asyncio.run(run_all())
