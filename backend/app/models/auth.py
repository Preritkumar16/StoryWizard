from pydantic import BaseModel, Field
from typing import List, Optional

class LoginRequest(BaseModel):
    role: str = Field(..., example="student", description="Role: 'student' or 'parent'")
    username_or_email: Optional[str] = Field(None, description="Username or email address")
    password_or_pin: Optional[str] = Field(None, description="Password or PIN")
    identifier: Optional[str] = Field(None, description="Identifier (email, username, or child code)")
    password: Optional[str] = Field(None, description="Parent password")
    pin: Optional[str] = Field(None, description="Student PIN")

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
