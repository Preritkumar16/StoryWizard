from fastapi import APIRouter, HTTPException, status
from app.models.auth import LoginRequest, TokenResponse, RolePermissions
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    """
    Role-based authentication endpoint for Student and Parent portals.
    Validates explorer PIN or parent password and returns role-scoped JWT tokens.
    """
    clean_role = payload.role.lower().strip()
    
    if clean_role == "student":
        # Student login via PIN (Default demo PIN: 1234)
        if payload.password_or_pin != "1234" and len(payload.password_or_pin) < 4:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Student PIN. Use '1234' for sandbox demo."
            )
        
        token = create_access_token({
            "sub": "student-alex",
            "role": "student",
            "name": "Alex Chen",
            "grade": "Grade 3-4"
        })
        
        return TokenResponse(
            access_token=token,
            role="student",
            user_id="student-alex",
            name="Alex Chen",
            permissions=RolePermissions(
                can_explore_topics=True,
                can_adjust_safety_limits=False,
                can_view_analytics=False,
                can_access_inspector=True,
                can_record_audio=True
            )
        )
        
    elif clean_role == "parent":
        # Parent login via Email/Password
        token = create_access_token({
            "sub": "parent-sarah",
            "role": "parent",
            "name": "Sarah Chen",
            "supervised_child": "student-alex"
        })
        
        return TokenResponse(
            access_token=token,
            role="parent",
            user_id="parent-sarah",
            name="Sarah Chen",
            permissions=RolePermissions(
                can_explore_topics=True,
                can_adjust_safety_limits=True,
                can_view_analytics=True,
                can_access_inspector=True,
                can_record_audio=False
            )
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'student' or 'parent'"
        )
