import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.auth import LoginRequest, TokenResponse, RolePermissions
from app.core.security import (
    create_access_token,
    verify_password,
    verify_pin,
    get_current_user_payload,
)
from app.database.collections import collections
from app.database.seed import seed_dev_accounts

logger = logging.getLogger("ai_storywizard.routers.auth")

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    """
    Role-based authentication endpoint for Student and Parent portals.
    Queries MongoDB 'users' or 'child_profiles' collections and verifies bcrypt hashes.
    Issues signed JWT access tokens containing user_id and role claims.
    """
    clean_role = payload.role.lower().strip()
    identifier = (payload.username_or_email or payload.identifier or "").strip()
    raw_credential = (payload.password_or_pin or payload.password or payload.pin or "").strip()

    if not identifier or not raw_credential:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required credentials (username/email/identifier or password/pin)"
        )

    if clean_role not in ("student", "parent"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'student' or 'parent'"
        )

    # 1. Check if database connection is available
    if collections.db is None:
        logger.error("MongoDB database is not connected during login request.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service is currently offline or unreachable. MongoDB connection is required for authentication."
        )

    # 2. Student Authentication via Child Profiles Collection
    if clean_role == "student":
        child_col = collections.child_profiles
        if child_col is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Child profiles collection is unavailable."
            )

        # Lookup by username, child_code, or unique _id
        child_doc = await child_col.find_one({
            "$or": [
                {"username": identifier.lower()},
                {"child_code": identifier},
                {"_id": identifier}
            ]
        })

        if not child_doc:
            logger.warning("Student login failed: identifier '%s' not found.", identifier)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid student username or child code."
            )

        stored_hash = child_doc.get("pin_hash")
        if not stored_hash or not verify_pin(raw_credential, stored_hash):
            logger.warning("Student login failed: invalid PIN for '%s'.", identifier)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid student PIN."
            )

        child_id = str(child_doc.get("_id", identifier))
        child_name = child_doc.get("name", "Student Explorer")

        # Minimum required claims in JWT (user_id and role)
        token = create_access_token({
            "sub": child_id,
            "user_id": child_id,
            "role": "student",
            "name": child_name
        })

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            role="student",
            user_id=child_id,
            name=child_name,
            permissions=RolePermissions(
                can_explore_topics=True,
                can_adjust_safety_limits=False,
                can_view_analytics=False,
                can_access_inspector=True,
                can_record_audio=True
            )
        )

    # 3. Parent Authentication via Users Collection
    elif clean_role == "parent":
        users_col = collections.users
        if users_col is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Users collection is unavailable."
            )

        # Lookup parent user by email
        user_doc = await users_col.find_one({"email": identifier.lower()})

        if not user_doc:
            logger.warning("Parent login failed: email '%s' not found.", identifier)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        stored_hash = user_doc.get("password_hash")
        if not stored_hash or not verify_password(raw_credential, stored_hash):
            logger.warning("Parent login failed: invalid password for '%s'.", identifier)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        user_id = str(user_doc.get("_id", identifier))
        user_name = user_doc.get("name", "Parent")

        # Minimum required claims in JWT (user_id and role)
        token = create_access_token({
            "sub": user_id,
            "user_id": user_id,
            "role": "parent",
            "name": user_name
        })

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            role="parent",
            user_id=user_id,
            name=user_name,
            permissions=RolePermissions(
                can_explore_topics=True,
                can_adjust_safety_limits=True,
                can_view_analytics=True,
                can_access_inspector=True,
                can_record_audio=False
            )
        )

@router.get("/me")
async def get_current_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    """
    Returns the authenticated session metadata extracted from the validated JWT token.
    Validates token integrity and expiry on protected requests.
    """
    return {
        "user_id": current_user.get("sub") or current_user.get("user_id"),
        "role": current_user.get("role"),
        "name": current_user.get("name"),
        "token_expires": current_user.get("exp")
    }

@router.post("/seed")
async def seed_database_accounts():
    """
    Utility endpoint to populate default test parent and student accounts in MongoDB.
    """
    result = await seed_dev_accounts()
    return result
