from pydantic import BaseModel, Field
from typing import List

class LoginRequest(BaseModel):
    username_or_email: str = Field(..., example="alex.chen" or "sarah.chen@example.com")
    password_or_pin: str = Field(..., example="1234")
    role: str = Field(..., example="student", description="Role: 'student' or 'parent'")

class RolePermissions(BaseModel):
    can_explore_topics: bool
    can_adjust_safety_limits: bool
    can_view_analytics: bool
    can_access_inspector: bool
    can_record_audio: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    name: str
    permissions: RolePermissions
